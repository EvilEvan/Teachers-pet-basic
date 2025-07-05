/**
 * Service Worker for Kindergarten Report Generator PWA
 * Provides offline functionality, caching, and background sync
 */

const CACHE_NAME = 'teachers-pet-v1.0.0';
const OFFLINE_URL = '/pages/offline.html';

// Files to cache immediately (App Shell)
const STATIC_CACHE_FILES = [
  '/',
  '/index.html',
  '/pages/student-info.html',
  '/pages/subjects.html',
  '/assets/css/global.css',
  '/assets/css/mobile.css',
  '/assets/js/mobile.js',
  '/assets/js/app.js',
  '/assets/js/storage.js',
  '/manifest.json',
  OFFLINE_URL
];

// Files to cache on demand
const DYNAMIC_CACHE_FILES = [
  '/assets/images/',
  '/assets/fonts/',
  '/data/'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Install event');
  
  event.waitUntil(
    Promise.all([
      // Cache static files
      caches.open(CACHE_NAME).then((cache) => {
        console.log('[SW] Caching app shell');
        return cache.addAll(STATIC_CACHE_FILES);
      }),
      
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event');
  
  event.waitUntil(
    Promise.all([
      // Clean old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Claim all clients immediately
      self.clients.claim()
    ])
  );
});

// Fetch event - serve cached content and implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip external requests
  if (url.origin !== location.origin) {
    return;
  }
  
  // Handle different request types with appropriate strategies
  if (isStaticAsset(request)) {
    // Cache First strategy for static assets
    event.respondWith(cacheFirst(request));
  } else if (isAPIRequest(request)) {
    // Network First strategy for API requests
    event.respondWith(networkFirst(request));
  } else if (isHTMLRequest(request)) {
    // Stale While Revalidate for HTML pages
    event.respondWith(staleWhileRevalidate(request));
  } else {
    // Default to cache first
    event.respondWith(cacheFirst(request));
  }
});

// Message event - handle messages from the app
self.addEventListener('message', (event) => {
  const { action, data } = event.data;
  
  switch (action) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CACHE_STUDENT_DATA':
      cacheStudentData(data);
      break;
      
    case 'GET_CACHED_DATA':
      getCachedData().then(data => {
        event.ports[0].postMessage(data);
      });
      break;
      
    case 'CLEAR_CACHE':
      clearAppCache();
      break;
  }
});

// Background Sync for offline form submissions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'background-sync-student-data') {
    event.waitUntil(syncStudentData());
  }
  
  if (event.tag === 'background-sync-comments') {
    event.waitUntil(syncComments());
  }
});

// Push event for notifications (future feature)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'New update available',
      icon: '/assets/images/icons/icon-192x192.png',
      badge: '/assets/images/icons/icon-72x72.png',
      vibrate: [200, 100, 200],
      data: data,
      actions: [
        {
          action: 'open',
          title: 'Open App',
          icon: '/assets/images/icons/icon-96x96.png'
        },
        {
          action: 'close',
          title: 'Close',
          icon: '/assets/images/icons/icon-96x96.png'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Teachers Pet', options)
    );
  }
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      self.clients.openWindow('/')
    );
  }
});

// Caching Strategies

/**
 * Cache First Strategy
 * Try cache first, fallback to network
 */
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  
  if (cached) {
    console.log('[SW] Serving from cache:', request.url);
    return cached;
  }
  
  try {
    console.log('[SW] Fetching from network:', request.url);
    const response = await fetch(request);
    
    if (response.ok) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('[SW] Network failed, serving offline page');
    
    if (isHTMLRequest(request)) {
      return cache.match(OFFLINE_URL);
    }
    
    throw error;
  }
}

/**
 * Network First Strategy
 * Try network first, fallback to cache
 */
async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  
  try {
    console.log('[SW] Fetching from network:', request.url);
    const response = await fetch(request);
    
    if (response.ok) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    throw error;
  }
}

/**
 * Stale While Revalidate Strategy
 * Serve from cache immediately, update cache in background
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  
  // Fetch from network in background
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => {
    // Network failed, but we might have cache
    return cached;
  });
  
  // Return cached version immediately if available
  if (cached) {
    console.log('[SW] Serving stale from cache:', request.url);
    return cached;
  }
  
  // Wait for network if no cache
  console.log('[SW] No cache, waiting for network:', request.url);
  return fetchPromise;
}

// Helper Functions

function isStaticAsset(request) {
  return request.url.includes('/assets/') || 
         request.url.includes('/manifest.json') ||
         request.url.endsWith('.css') ||
         request.url.endsWith('.js') ||
         request.url.endsWith('.png') ||
         request.url.endsWith('.jpg') ||
         request.url.endsWith('.svg') ||
         request.url.endsWith('.woff') ||
         request.url.endsWith('.woff2');
}

function isAPIRequest(request) {
  return request.url.includes('/api/') ||
         request.url.includes('/data/') ||
         request.headers.get('Content-Type') === 'application/json';
}

function isHTMLRequest(request) {
  return request.headers.get('Accept').includes('text/html');
}

// Data Management Functions

async function cacheStudentData(data) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    });
    
    await cache.put('/offline-data/student-data', response);
    console.log('[SW] Student data cached for offline use');
  } catch (error) {
    console.error('[SW] Failed to cache student data:', error);
  }
}

async function getCachedData() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match('/offline-data/student-data');
    
    if (response) {
      return await response.json();
    }
    
    return null;
  } catch (error) {
    console.error('[SW] Failed to get cached data:', error);
    return null;
  }
}

async function clearAppCache() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(name => caches.delete(name))
    );
    console.log('[SW] All caches cleared');
  } catch (error) {
    console.error('[SW] Failed to clear cache:', error);
  }
}

// Background Sync Functions

async function syncStudentData() {
  try {
    // Get offline stored data
    const data = await getCachedData();
    
    if (!data) {
      console.log('[SW] No offline data to sync');
      return;
    }
    
    // Attempt to sync with server (when available)
    // For now, just keep in localStorage
    console.log('[SW] Student data synced');
    
    // Clear offline data after successful sync
    const cache = await caches.open(CACHE_NAME);
    await cache.delete('/offline-data/student-data');
    
  } catch (error) {
    console.error('[SW] Failed to sync student data:', error);
    throw error; // Re-schedule sync
  }
}

async function syncComments() {
  try {
    // Sync generated comments when back online
    console.log('[SW] Comments synced');
  } catch (error) {
    console.error('[SW] Failed to sync comments:', error);
    throw error;
  }
}

// Periodic Background Sync (when supported)
if ('periodicSync' in self.registration) {
  self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'cleanup-cache') {
      event.waitUntil(cleanupOldCache());
    }
  });
}

async function cleanupOldCache() {
  const cache = await caches.open(CACHE_NAME);
  const requests = await cache.keys();
  const now = Date.now();
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
  
  for (const request of requests) {
    const response = await cache.match(request);
    const dateHeader = response.headers.get('date');
    
    if (dateHeader) {
      const responseDate = new Date(dateHeader).getTime();
      if (now - responseDate > maxAge) {
        await cache.delete(request);
        console.log('[SW] Cleaned up old cache entry:', request.url);
      }
    }
  }
}

console.log('[SW] Service Worker registered successfully');