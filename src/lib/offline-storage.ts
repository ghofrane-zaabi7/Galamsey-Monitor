/**
 * Offline Storage Manager using IndexedDB
 * Handles offline incident reports, cached data, and sync queue
 */

const DB_NAME = 'galamsey-offline';
const DB_VERSION = 1;

// Store names
const STORES = {
  PENDING_INCIDENTS: 'pending_incidents',
  CACHED_INCIDENTS: 'cached_incidents',
  CACHED_WATER: 'cached_water',
  CACHED_SITES: 'cached_sites',
  DRAFT_REPORTS: 'draft_reports',
  SYNC_QUEUE: 'sync_queue',
  USER_DATA: 'user_data',
} as const;

// Types
export interface PendingIncident {
  id: string;
  data: IncidentFormData;
  evidenceFiles: StoredFile[];
  createdAt: number;
  attempts: number;
  lastAttempt?: number;
  status: 'pending' | 'syncing' | 'failed';
  errorMessage?: string;
}

export interface IncidentFormData {
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  locationAccuracy?: number;
  region: string;
  district: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  incident_type: 'illegal_mining' | 'water_pollution' | 'deforestation' | 'land_degradation';
  reported_by: string;
  contact_phone?: string;
  voiceTranscript?: string;
  language?: string;
}

export interface StoredFile {
  id: string;
  name: string;
  type: string;
  size: number;
  data: ArrayBuffer;
  thumbnail?: ArrayBuffer;
  metadata: {
    timestamp: number;
    latitude?: number;
    longitude?: number;
    accuracy?: number;
  };
}

export interface DraftReport {
  id: string;
  data: Partial<IncidentFormData>;
  evidenceFiles: StoredFile[];
  lastModified: number;
}

export interface SyncQueueItem {
  id: string;
  type: 'incident' | 'evidence' | 'update';
  action: 'create' | 'update' | 'delete';
  data: unknown;
  createdAt: number;
  priority: number;
}

// Open database
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create stores if they don't exist
      if (!db.objectStoreNames.contains(STORES.PENDING_INCIDENTS)) {
        const store = db.createObjectStore(STORES.PENDING_INCIDENTS, { keyPath: 'id' });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.CACHED_INCIDENTS)) {
        const store = db.createObjectStore(STORES.CACHED_INCIDENTS, { keyPath: 'id' });
        store.createIndex('region', 'region', { unique: false });
        store.createIndex('severity', 'severity', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.CACHED_WATER)) {
        db.createObjectStore(STORES.CACHED_WATER, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORES.CACHED_SITES)) {
        db.createObjectStore(STORES.CACHED_SITES, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORES.DRAFT_REPORTS)) {
        const store = db.createObjectStore(STORES.DRAFT_REPORTS, { keyPath: 'id' });
        store.createIndex('lastModified', 'lastModified', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
        const store = db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id' });
        store.createIndex('priority', 'priority', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.USER_DATA)) {
        db.createObjectStore(STORES.USER_DATA, { keyPath: 'key' });
      }
    };
  });
}

// Generic CRUD operations
async function addItem<T>(storeName: string, item: T): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.add(item);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

async function putItem<T>(storeName: string, item: T): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.put(item);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

async function getItem<T>(storeName: string, key: string | number): Promise<T | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.get(key);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result as T | undefined);
  });
}

async function getAllItems<T>(storeName: string): Promise<T[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result as T[]);
  });
}

async function deleteItem(storeName: string, key: string | number): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.delete(key);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

async function clearStore(storeName: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.clear();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

// ============ Pending Incidents ============

export async function savePendingIncident(
  data: IncidentFormData,
  evidenceFiles: StoredFile[] = []
): Promise<string> {
  const id = generateId();
  const pendingIncident: PendingIncident = {
    id,
    data,
    evidenceFiles,
    createdAt: Date.now(),
    attempts: 0,
    status: 'pending',
  };
  await addItem(STORES.PENDING_INCIDENTS, pendingIncident);
  return id;
}

export async function getPendingIncidents(): Promise<PendingIncident[]> {
  return getAllItems<PendingIncident>(STORES.PENDING_INCIDENTS);
}

export async function getPendingIncident(id: string): Promise<PendingIncident | undefined> {
  return getItem<PendingIncident>(STORES.PENDING_INCIDENTS, id);
}

export async function updatePendingIncident(
  id: string,
  updates: Partial<PendingIncident>
): Promise<void> {
  const existing = await getPendingIncident(id);
  if (existing) {
    await putItem(STORES.PENDING_INCIDENTS, { ...existing, ...updates });
  }
}

export async function deletePendingIncident(id: string): Promise<void> {
  await deleteItem(STORES.PENDING_INCIDENTS, id);
}

export async function getPendingIncidentsCount(): Promise<number> {
  const items = await getPendingIncidents();
  return items.filter(item => item.status === 'pending').length;
}

// ============ Draft Reports ============

export async function saveDraft(
  data: Partial<IncidentFormData>,
  evidenceFiles: StoredFile[] = [],
  existingId?: string
): Promise<string> {
  const id = existingId || generateId();
  const draft: DraftReport = {
    id,
    data,
    evidenceFiles,
    lastModified: Date.now(),
  };
  await putItem(STORES.DRAFT_REPORTS, draft);
  return id;
}

export async function getDraft(id: string): Promise<DraftReport | undefined> {
  return getItem<DraftReport>(STORES.DRAFT_REPORTS, id);
}

export async function getAllDrafts(): Promise<DraftReport[]> {
  return getAllItems<DraftReport>(STORES.DRAFT_REPORTS);
}

export async function deleteDraft(id: string): Promise<void> {
  await deleteItem(STORES.DRAFT_REPORTS, id);
}

// ============ Cached Data ============

export async function cacheIncidents(incidents: unknown[]): Promise<void> {
  await clearStore(STORES.CACHED_INCIDENTS);
  for (const incident of incidents) {
    await putItem(STORES.CACHED_INCIDENTS, incident);
  }
}

export async function getCachedIncidents(): Promise<unknown[]> {
  return getAllItems(STORES.CACHED_INCIDENTS);
}

export async function cacheWaterReadings(readings: unknown[]): Promise<void> {
  await clearStore(STORES.CACHED_WATER);
  for (const reading of readings) {
    await putItem(STORES.CACHED_WATER, reading);
  }
}

export async function getCachedWaterReadings(): Promise<unknown[]> {
  return getAllItems(STORES.CACHED_WATER);
}

export async function cacheMiningSites(sites: unknown[]): Promise<void> {
  await clearStore(STORES.CACHED_SITES);
  for (const site of sites) {
    await putItem(STORES.CACHED_SITES, site);
  }
}

export async function getCachedMiningSites(): Promise<unknown[]> {
  return getAllItems(STORES.CACHED_SITES);
}

// ============ Sync Queue ============

export async function addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'createdAt'>): Promise<string> {
  const id = generateId();
  const queueItem: SyncQueueItem = {
    ...item,
    id,
    createdAt: Date.now(),
  };
  await addItem(STORES.SYNC_QUEUE, queueItem);
  return id;
}

export async function getSyncQueue(): Promise<SyncQueueItem[]> {
  const items = await getAllItems<SyncQueueItem>(STORES.SYNC_QUEUE);
  return items.sort((a, b) => b.priority - a.priority || a.createdAt - b.createdAt);
}

export async function removeFromSyncQueue(id: string): Promise<void> {
  await deleteItem(STORES.SYNC_QUEUE, id);
}

export async function clearSyncQueue(): Promise<void> {
  await clearStore(STORES.SYNC_QUEUE);
}

// ============ User Data ============

export async function setUserData(key: string, value: unknown): Promise<void> {
  await putItem(STORES.USER_DATA, { key, value, updatedAt: Date.now() });
}

export async function getUserData<T>(key: string): Promise<T | undefined> {
  const item = await getItem<{ key: string; value: T }>(STORES.USER_DATA, key);
  return item?.value;
}

// ============ File Helpers ============

export async function fileToStoredFile(file: File): Promise<StoredFile> {
  const arrayBuffer = await file.arrayBuffer();

  // Generate thumbnail for images
  let thumbnail: ArrayBuffer | undefined;
  if (file.type.startsWith('image/')) {
    thumbnail = await generateThumbnail(file);
  }

  return {
    id: generateId(),
    name: file.name,
    type: file.type,
    size: file.size,
    data: arrayBuffer,
    thumbnail,
    metadata: {
      timestamp: Date.now(),
    },
  };
}

async function generateThumbnail(file: File, maxSize = 200): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      const scale = Math.min(maxSize / img.width, maxSize / img.height);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            blob.arrayBuffer().then(resolve).catch(reject);
          } else {
            reject(new Error('Failed to generate thumbnail'));
          }
        },
        'image/jpeg',
        0.7
      );
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export function storedFileToBlob(storedFile: StoredFile): Blob {
  return new Blob([storedFile.data], { type: storedFile.type });
}

export function storedFileToFile(storedFile: StoredFile): File {
  return new File([storedFile.data], storedFile.name, { type: storedFile.type });
}

// ============ Utility Functions ============

export async function getStorageStats(): Promise<{
  pendingIncidents: number;
  drafts: number;
  syncQueueItems: number;
  cachedIncidents: number;
}> {
  const [pending, drafts, queue, cached] = await Promise.all([
    getPendingIncidents(),
    getAllDrafts(),
    getSyncQueue(),
    getCachedIncidents(),
  ]);

  return {
    pendingIncidents: pending.length,
    drafts: drafts.length,
    syncQueueItems: queue.length,
    cachedIncidents: cached.length,
  };
}

export async function clearAllData(): Promise<void> {
  const db = await openDB();
  const storeNames = Object.values(STORES);

  for (const storeName of storeNames) {
    if (db.objectStoreNames.contains(storeName)) {
      await clearStore(storeName);
    }
  }
}

// Check if IndexedDB is available
export function isOfflineStorageAvailable(): boolean {
  return typeof indexedDB !== 'undefined';
}
