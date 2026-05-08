const CACHE_NAME = 'motolog-cache-v1';
const urlsToCache = [
  './',
  './index.html'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  // Simple fetch-first with cache fallback strategy
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// Nasłuch powiadomień PUSH w tle (Firebase Messages)
self.addEventListener('push', event => {
  let data = { title: 'MotoLog & Find', body: 'Nowa wiadomość systemowa' };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'MotoLog & Find', body: event.data.text() };
    }
  }
  
  const options = {
    body: data.body,
    icon: './favicon.svg',
    badge: './favicon.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});
