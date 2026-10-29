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
  './data/c56x/index.js',
  './data/c56x/core.js',
  './data/c56x/takeoff-gradient-dry.js',
  './data/c56x/takeoff-dry-flaps7.js',
  './data/c56x/takeoff-gradient-wet.js',
  './data/c56x/takeoff-wet-flaps7.js',
  './data/c56x/takeoff-wet-flaps15.js',
  './data/c56x/takeoff-wet-flaps15-no-reverser.js',
  './data/c56x/takeoff-dry-flaps15.js',
  './data/c56x/climb-flightpath-flaps7.js',
  './data/c56x/climb-gradient-flaps7.js',
  './data/c56x/climb-gradient-flaps15-off.js',
  './data/c56x/climb-gradient-flaps15-on.js',
  './data/c56x/calculations.js',
  './data/airports.json',
  './data/lib/xlsx.full.min.js',
  './data/lib/hyperformula.full.min.js',
  './data/se-ltl.xlsx',
  './data/se-kvl.xlsx',
  './data/se-mju.xlsx',
  './data/B190.xlsx',
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
  const url = new URL(event.request.url);

  // Om anropet INTE går till vår egen server (t.ex. AllOrigins eller Aviation Weather),
  // låt webbläsaren sköta det direkt utan att Service Workern lägger sig i.
  if (url.origin !== location.origin) {
    return;
  }

  // För egna filer: kör cache- och offline-logik
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