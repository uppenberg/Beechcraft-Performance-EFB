// Increment the cache version for every published app release. Tested and working version of HyperFormula is 3.5.0, SheetJS (xlsx): v0.20.3
importScripts('./version.js');
const CACHE_NAME = `be20-efb-v${self.APP_VERSION}`;
const ASSETS = [
  './index.html',
  './style.css',
  './version.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './js/app.js',
  './data/airports.json',
  './data/se-ltl.xlsx',
  './data/se-kvl.xlsx',
  './data/se-mju.xlsx',
  './data/B190.xlsx',
  'https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js',
  'https://cdn.jsdelivr.net/npm/hyperformula@latest/dist/hyperformula.full.min.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) =>
        cache.addAll(ASSETS.map((asset) => new Request(asset, { cache: 'reload' })))
      )
      .catch(async (error) => {
        await caches.delete(CACHE_NAME);
        throw error;
      })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => cacheName.startsWith('be20-efb-') && cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName))
        )
      ),
      self.clients.claim()
    ])
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    (async () => {
      const cachedResponse = await caches.match(event.request);
      if (cachedResponse) return cachedResponse;

      try {
        const response = await fetch(event.request);
        return response;
      } catch (error) {
        if (event.request.mode === 'navigate') {
          const offlinePage = await caches.match('./index.html');
          if (offlinePage) return offlinePage;
        }
        throw error;
      }
    })()
  );
});
