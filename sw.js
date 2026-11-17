// Bump version.js for every release. Keep this complete offline list in sync
// with the files loaded by the app.
importScripts('./version.js');

if (!self.APP_VERSION) throw new Error('The app release version is missing.');

const CACHE_PREFIX = 'be20-efb-v';
const CACHE_NAME = `${CACHE_PREFIX}${self.APP_VERSION}`;
const ASSETS = [
  './index.html',
  './style.css',
  './version.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './js/release-check.js',
  './js/app.js',
  './js/metar-weather.js',
  './js/app-state.js',
  './js/aircraft-ui.js',
  './js/offline-ui.js',
  './js/workbook-data.js',
  './js/airport-ui.js',
  './js/workbook-adapter.js',
  './js/workbook-engine.js',
  './js/c56x-ui.js',
  './js/performance-inputs.js',
  './js/performance-limits.js',
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
const SCOPE_URL = new URL(self.registration.scope);
const assetUrls = new Map(ASSETS.map((asset) => {
  const url = new URL(asset, SCOPE_URL);
  return [url.pathname, { asset, url: url.href }];
}));
const indexUrl = new URL('./index.html', SCOPE_URL).href;
let updateInitiatorClientId = null;

function releaseRequest(url) {
  const requestUrl = new URL(url);
  requestUrl.searchParams.set('v', self.APP_VERSION);
  return new Request(requestUrl.href, { cache: 'reload' });
}

async function downloadAsset(url) {
  const response = await fetch(releaseRequest(url));
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response;
}

async function addAssetsAtomically(cache, entries) {
  if (!entries.length) return [];
  const requests = entries.map(({ url }) => releaseRequest(url));
  let batchError = null;
  try {
    await cache.addAll(requests);
  } catch (error) {
    batchError = error;
  }

  return Promise.all(entries.map(async (entry, index) => {
    const response = await cache.match(requests[index]);
    if (!response?.ok) {
      return { asset: entry.asset, reason: batchError?.message || 'Download failed.' };
    }
    try {
      // Store assets under stable URLs for normal fetches and offline checks.
      await cache.put(entry.url, response);
      await cache.delete(requests[index]);
      return null;
    } catch (error) {
      return { asset: entry.asset, reason: error.message || String(error) };
    }
  }));
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const existingCaches = await caches.keys();
    const cacheAlreadyExisted = existingCaches.includes(CACHE_NAME);
    const cache = await caches.open(CACHE_NAME);
    const missing = [];
    for (const entry of assetUrls.values()) {
      if (!await cache.match(entry.url)) missing.push(entry);
    }
    const failures = (await addAssetsAtomically(cache, missing)).filter(Boolean);
    if (failures.length) {
      // A failed new release must not leave a partial snapshot. Keep an
      // existing same-version cache intact so offline repair can retry it.
      if (!cacheAlreadyExisted) await caches.delete(CACHE_NAME);
      throw new Error(`Could not install offline assets: ${failures.map(({ asset }) => asset).join(', ')}`);
    }
  })());
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    updateInitiatorClientId = event.source?.id || null;
    event.waitUntil(self.skipWaiting());
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
  for (const { asset, url } of assetUrls.values()) {
    const cached = await cache.match(url);
    if (cached?.ok) continue;
    missing.push(asset);
  }
  if (!downloadMissing || !missing.length) {
    return { ready: missing.length === 0, total: ASSETS.length, missing, failed: [] };
  }
  const entries = missing.map((asset) => assetUrls.get(new URL(asset, SCOPE_URL).pathname));
  const failed = (await addAssetsAtomically(cache, entries)).filter(Boolean);
  return {
    ready: failed.length === 0,
    total: ASSETS.length,
    missing: failed.map((entry) => entry.asset),
    failed,
  };
}

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const oldCaches = (await caches.keys()).filter((name) =>
      name.startsWith('be20-efb-') && name !== CACHE_NAME
    );
    await self.clients.claim();
    if (oldCaches.length) {
      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of clients) {
        if (client.url.startsWith(SCOPE_URL.href) && client.id !== updateInitiatorClientId) {
          client.navigate(client.url).catch((error) => console.error('Could not reload app tab:', error));
        }
      }
      await Promise.all(oldCaches.map((name) => caches.delete(name)));
    }
  })());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== SCOPE_URL.origin || event.request.method !== 'GET') return;
  const inScope = url.pathname === SCOPE_URL.pathname || url.pathname === `${SCOPE_URL.pathname}index.html`;
  const managedAsset = event.request.mode === 'navigate' && inScope
    ? { asset: './index.html', url: indexUrl }
    : assetUrls.get(url.pathname);
  if (!managedAsset) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(managedAsset.url);

    // Always check the central release number online; fall back to the saved copy offline.
    if (managedAsset.asset === './version.js') {
      try {
        return await downloadAsset(managedAsset.url);
      } catch {
        if (cached) return cached;
        throw new Error('The app release version is unavailable.');
      }
    }

    if (cached) return cached;
    try {
      const response = await downloadAsset(managedAsset.url);
      await cache.put(managedAsset.url, response.clone());
      return response;
    } catch {
      return new Response('Offline app file unavailable. Reconnect and retry the offline download.', {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
      });
    }
  })());
});
