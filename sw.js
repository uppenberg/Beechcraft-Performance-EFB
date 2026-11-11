// Bump version.js for every release. Each release gets its own offline snapshot.
importScripts('./version.js', './asset-files.js');

if (!self.APP_VERSION) throw new Error('The app release version is missing.');

const CACHE_PREFIX = 'be20-efb-v';
const CACHE_NAME = `${CACHE_PREFIX}${self.APP_VERSION}`;
const ASSETS = self.EFB_OFFLINE_ASSETS;
if (!Array.isArray(ASSETS) || ASSETS.length === 0) {
  throw new Error('The offline asset list is missing.');
}
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

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    const missing = [];
    for (const entry of assetUrls.values()) {
      if (!await cache.match(entry.url)) missing.push(entry);
    }
    try {
      for (const { url } of missing) {
        await cache.put(url, await downloadAsset(url));
      }
    } catch (error) {
      // Preserve a snapshot already used by the active worker.
      if (!(await caches.keys()).includes(CACHE_NAME) || missing.length === ASSETS.length) {
        await caches.delete(CACHE_NAME);
      }
      throw error;
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
  const failed = [];
  for (const { asset, url } of assetUrls.values()) {
    const cached = await cache.match(url);
    if (cached?.ok) continue;
    missing.push(asset);
    if (!downloadMissing) continue;
    try {
      await cache.put(url, await downloadAsset(url));
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
