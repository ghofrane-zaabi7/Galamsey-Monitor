/**
 * Sync Manager - Handles background synchronization of offline data
 */

import {
  getPendingIncidents,
  updatePendingIncident,
  deletePendingIncident,
  storedFileToFile,
  type PendingIncident,
} from './offline-storage';

// Sync configuration
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 5000; // 5 seconds
const SYNC_INTERVAL_MS = 30000; // 30 seconds

// Sync status
export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error' | 'offline';

interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  errors: string[];
}

interface SyncEventDetail {
  type: 'start' | 'progress' | 'complete' | 'error';
  status: SyncStatus;
  progress?: number;
  total?: number;
  result?: SyncResult;
  error?: string;
}

// Custom event for sync status updates
export const SYNC_EVENT = 'galamsey-sync';

function dispatchSyncEvent(detail: SyncEventDetail): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail }));
  }
}

// Check if online
export function isOnline(): boolean {
  if (typeof navigator === 'undefined') return true;
  return navigator.onLine;
}

// Listen for online/offline events
export function setupNetworkListeners(
  onOnline: () => void,
  onOffline: () => void
): () => void {
  if (typeof window === 'undefined') return () => {};

  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);

  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
}

// Sync a single pending incident
async function syncIncident(incident: PendingIncident): Promise<{ success: boolean; error?: string }> {
  try {
    // Mark as syncing
    await updatePendingIncident(incident.id, {
      status: 'syncing',
      lastAttempt: Date.now(),
      attempts: incident.attempts + 1,
    });

    // Prepare form data
    const formData = new FormData();

    // Add incident data
    Object.entries(incident.data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    // Add evidence files
    for (const storedFile of incident.evidenceFiles) {
      const file = storedFileToFile(storedFile);
      formData.append('evidence', file);
    }

    // Add metadata
    formData.append('_offlineId', incident.id);
    formData.append('_offlineCreatedAt', String(incident.createdAt));

    // Submit to server
    const response = await fetch('/api/incidents', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    // Success - delete from pending queue
    await deletePendingIncident(incident.id);

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Update status based on retry attempts
    if (incident.attempts + 1 >= MAX_RETRY_ATTEMPTS) {
      await updatePendingIncident(incident.id, {
        status: 'failed',
        errorMessage,
      });
    } else {
      await updatePendingIncident(incident.id, {
        status: 'pending',
        errorMessage,
      });
    }

    return { success: false, error: errorMessage };
  }
}

// Sync all pending incidents
export async function syncAllPendingIncidents(): Promise<SyncResult> {
  const result: SyncResult = {
    success: true,
    synced: 0,
    failed: 0,
    errors: [],
  };

  // Check if online
  if (!isOnline()) {
    dispatchSyncEvent({
      type: 'error',
      status: 'offline',
      error: 'Cannot sync while offline',
    });
    return { ...result, success: false, errors: ['Cannot sync while offline'] };
  }

  // Get pending incidents
  const pendingIncidents = await getPendingIncidents();
  const incidentsToSync = pendingIncidents.filter(
    (i) => i.status === 'pending' && i.attempts < MAX_RETRY_ATTEMPTS
  );

  if (incidentsToSync.length === 0) {
    dispatchSyncEvent({
      type: 'complete',
      status: 'success',
      result,
    });
    return result;
  }

  // Dispatch start event
  dispatchSyncEvent({
    type: 'start',
    status: 'syncing',
    total: incidentsToSync.length,
  });

  // Sync each incident
  for (let i = 0; i < incidentsToSync.length; i++) {
    const incident = incidentsToSync[i];

    // Dispatch progress event
    dispatchSyncEvent({
      type: 'progress',
      status: 'syncing',
      progress: i + 1,
      total: incidentsToSync.length,
    });

    const syncResult = await syncIncident(incident);

    if (syncResult.success) {
      result.synced++;
    } else {
      result.failed++;
      if (syncResult.error) {
        result.errors.push(`${incident.data.title}: ${syncResult.error}`);
      }
    }

    // Delay between syncs to avoid overwhelming the server
    if (i < incidentsToSync.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  result.success = result.failed === 0;

  // Dispatch complete event
  dispatchSyncEvent({
    type: 'complete',
    status: result.success ? 'success' : 'error',
    result,
  });

  return result;
}

// Auto-sync manager
let syncIntervalId: NodeJS.Timeout | null = null;
let isSyncing = false;

export function startAutoSync(): void {
  if (syncIntervalId) return;

  const performSync = async () => {
    if (isSyncing || !isOnline()) return;

    isSyncing = true;
    try {
      await syncAllPendingIncidents();
    } finally {
      isSyncing = false;
    }
  };

  // Initial sync
  performSync();

  // Set up interval
  syncIntervalId = setInterval(performSync, SYNC_INTERVAL_MS);

  // Sync when coming back online
  setupNetworkListeners(
    () => {
      console.log('[SyncManager] Back online, syncing...');
      performSync();
    },
    () => {
      console.log('[SyncManager] Went offline');
    }
  );
}

export function stopAutoSync(): void {
  if (syncIntervalId) {
    clearInterval(syncIntervalId);
    syncIntervalId = null;
  }
}

// Manual sync trigger
export async function triggerSync(): Promise<SyncResult> {
  if (isSyncing) {
    return {
      success: false,
      synced: 0,
      failed: 0,
      errors: ['Sync already in progress'],
    };
  }

  isSyncing = true;
  try {
    return await syncAllPendingIncidents();
  } finally {
    isSyncing = false;
  }
}

// Get sync status
export function isSyncInProgress(): boolean {
  return isSyncing;
}

// Register service worker for background sync
export async function registerBackgroundSync(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    if ('sync' in registration) {
      await (registration as ServiceWorkerRegistration & { sync: { register: (tag: string) => Promise<void> } }).sync.register('sync-incidents');
      console.log('[SyncManager] Background sync registered');
      return true;
    }
  } catch (error) {
    console.error('[SyncManager] Background sync registration failed:', error);
  }

  return false;
}

// Listen for service worker messages
export function setupServiceWorkerListener(): void {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data.type === 'SYNC_OFFLINE_INCIDENTS') {
      triggerSync();
    }
  });
}
