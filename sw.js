// HabitWar Service Worker
// Provides offline support and caching

const CACHE_NAME = 'habitwar-v2.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/home-styles.css',
  '/app.js',
  '/data/quotes.js',
  '/pages/daily.html',
  '/pages/analytics.html',
  '/pages/habits.html',
  '/pages/streaks.html',
  '/pages/gratitude.html',
  '/manifest.json'
];

// Install event - cache files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('HabitWar: Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.log('HabitWar: Cache failed', err);
      })
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('HabitWar: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        
        return fetch(event.request).then(response => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone the response
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        });
      })
      .catch(() => {
        // Offline fallback for HTML pages
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      })
  );
});

// Background sync for habit data (future enhancement)
self.addEventListener('sync', event => {
  if (event.tag === 'sync-habits') {
    console.log('HabitWar: Background sync triggered');
  }
});

// Push notifications (future enhancement)
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'Time to check your habits!',
    icon: '/favicon.jpg',
    badge: '/favicon.jpg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      { action: 'open', title: 'Open HabitWar' },
      { action: 'close', title: 'Dismiss' }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('HabitWar', options)
  );
});
