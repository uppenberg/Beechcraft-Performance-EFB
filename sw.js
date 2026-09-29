const CACHE_NAME = 'be20-efb-v2';
const ASSETS = [
  './index.html',
  './manifest.json',
  './js/db.js',
  './js/performance.js',
  './js/app.js',
  './data/airports.json',
  './data/factors.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
