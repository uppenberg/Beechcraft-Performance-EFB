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
  './js/metar-weather.js',
  './js/app-state.js',
  './js/aircraft-ui.js',
  './js/offline-ui.js',
  './js/workbook-data.js',
  './js/airport-ui.js',
  './js/workbook-engine.js',
  './js/c56x-ui.js',
  './js/results-ui.js',
  './data/c56x/index.js',
  './data/c56x/core.js',
  './data/c56x/takeoff-gradient-dry.js',
  './data/c56x/takeoff-dry-flaps7.js',
  './data/c56x/takeoff-gradient-wet.js',
  './data/c56x/takeoff-dry-flaps15.js',
  './data/c56x/climb-flightpath-flaps7.js',
  './data/c56x/climb-gradient-flaps7.js',
  './data/c56x/climb-gradient-flaps15-off.js',
  './data/c56x/climb-gradient-flaps15-on.js',
  './data/c56x/gross-climb-gradient-flaps15-off.js',
  './data/c56x/gross-climb-gradient-flaps15-on.js',
  './data/c56x/landing-gross-climb-gradient-flaps35-off.js',
  './data/c56x/landing-gross-climb-gradient-flaps35-on.js',
  './data/c56x/landing-distance-flaps35.js',
  './data/c56x/landing-weight-flaps15-35-off.js',
  './data/c56x/calculations.js',
  './data/c56x/landing-weight-flaps15-35-on.js',
  './data/c56x/landing-calculations.js',
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
    return;
  }

  if (!['CHECK_OFFLINE_DATA', 'RETRY_OFFLINE_DATA'].includes(event.data?.type)) return;
  const port = event.ports?.[0];
  if (!port) return;
  event.waitUntil(ensureOfflineData(event.data.type === 'RETRY_OFFLINE_DATA')
    .then((result) => port.postMessage(result))
    .catch((error) => port.postMessage({
      ready: false,
      total: ASSETS.length,
      missing: ASSETS,
      error: error.message || String(error),
    })));
});

async function ensureOfflineData(downloadMissing) {
  const cache = await caches.open(CACHE_NAME);
  const missing = [];
  const failed = [];

  for (const asset of ASSETS) {
    const url = new URL(asset, self.registration.scope).href;
    const cached = await cache.match(url);
    if (cached?.ok) continue;
    missing.push(asset);
    if (!downloadMissing) continue;

    try {
      const response = await fetch(new Request(url, { cache: 'reload' }));
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      await cache.put(url, response);
    } catch (error) {
      failed.push({ asset, reason: error.message || String(error) });
    }
  }

  return {
    ready: failed.length === 0 && (downloadMissing || missing.length === 0),
    total: ASSETS.length,
    missing: downloadMissing ? failed.map((entry) => entry.asset) : missing,
    failed,
  };
}

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
        if (event.request.mode === 'navigate' && !response.ok) {
          const offlinePage = await caches.match('./index.html');
          if (offlinePage) return offlinePage;
        }
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
