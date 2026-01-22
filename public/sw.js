// Galamsey Monitor Service Worker
const CACHE_NAME = 'galamsey-v1';
const OFFLINE_URL = '/offline';

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/offline',
  '/report',
  '/map',
  '/water',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// API routes that should use network-first strategy
const API_ROUTES = [
  '/api/incidents',
  '/api/stats',
  '/api/water',
  '/api/sites',
  '/api/notifications',
];

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Precaching assets');
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  // Activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  // Take control of all pages immediately
  self.clients.claim();
});

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests for caching (but handle POST for background sync)
  if (request.method !== 'GET') {
    // Handle POST requests to /api/incidents for offline queue
    if (request.method === 'POST' && url.pathname === '/api/incidents') {
      event.respondWith(handleOfflineIncidentSubmission(request));
    }
    return;
  }

  // API requests - network first, cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Static assets and pages - cache first, network fallback
  event.respondWith(cacheFirstStrategy(request));
});

// Network first strategy - try network, fallback to cache
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline JSON for API requests
    return new Response(
      JSON.stringify({
        offline: true,
        error: 'You are offline. Data will sync when connection is restored.',
        cached: false
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Cache first strategy - try cache, fallback to network
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    // Refresh cache in background
    fetch(request).then((networkResponse) => {
      if (networkResponse.ok) {
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, networkResponse);
        });
      }
    }).catch(() => {});

    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Offline, serving offline page');

    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match(OFFLINE_URL) || new Response(
        '<!DOCTYPE html><html><head><title>Offline</title></head><body><h1>You are offline</h1><p>Please check your connection.</p></body></html>',
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    return new Response('Offline', { status: 503 });
  }
}

// Handle offline incident submission
async function handleOfflineIncidentSubmission(request) {
  try {
    // Try to submit online
    const response = await fetch(request.clone());
    return response;
  } catch (error) {
    // Store in IndexedDB for later sync
    const formData = await request.clone().formData().catch(() => null);
    const jsonData = formData ? null : await request.clone().json().catch(() => null);

    const incidentData = formData || jsonData;

    if (incidentData) {
      // Notify the client to store the data
      const clients = await self.clients.matchAll();
      clients.forEach((client) => {
        client.postMessage({
          type: 'OFFLINE_INCIDENT_QUEUED',
          data: incidentData,
          timestamp: Date.now(),
        });
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        offline: true,
        message: 'Your report has been saved and will be submitted when you\'re back online.',
        queued: true,
      }),
      {
        status: 202,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Background sync event
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-incidents') {
    event.waitUntil(syncOfflineIncidents());
  }
});

// Sync offline incidents
async function syncOfflineIncidents() {
  // Notify clients to perform sync
  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage({
      type: 'SYNC_OFFLINE_INCIDENTS',
    });
  });
}

// Push notification event
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();

  const options = {
    body: data.body || 'New notification',
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
      dateOfArrival: Date.now(),
    },
    actions: [
      { action: 'view', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Galamsey Monitor', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Focus existing window if open
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Message event - handle client messages
self.addEventListener('message', (event) => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }
});

console.log('[SW] Service Worker loaded');
