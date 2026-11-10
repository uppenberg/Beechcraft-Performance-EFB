// Each worker is tied to an immutable, SHA-256-verified release snapshot.
// Release build: 4fcce0c21364906aed8cea9f8b8cb80d7ecea221d940ca4a096ac4a2605907ca
importScripts('./version.js', './asset-manifest.js');
const MANIFEST = self.EFB_ASSET_MANIFEST;
if (!MANIFEST || MANIFEST.version !== self.APP_VERSION) {
  throw new Error('Offline asset manifest does not match the app version.');
}
const CACHE_PREFIX = 'be20-efb-v';
const CACHE_NAME = `${CACHE_PREFIX}${self.APP_VERSION}-${MANIFEST.buildId}`;
const ASSETS = Object.keys(MANIFEST.hashes);
const SCOPE_URL = new URL(self.registration.scope);
const assetUrls = new Map(ASSETS.map((asset) => {
  const url = new URL(asset, SCOPE_URL);
  return [url.pathname, { asset, url: url.href }];
}));
const indexUrl = new URL('./index.html', SCOPE_URL).href;
let updateInitiatorClientId = null;

async function matchesAsset(response, asset) {
  if (!response || !response.ok) return false;
  const bytes = await response.clone().arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  const actual = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
  return actual === MANIFEST.hashes[asset];
}

async function downloadVerified(asset, url) {
  const response = await fetch(new Request(url, { cache: 'reload' }));
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  if (!await matchesAsset(response, asset)) throw new Error('File does not match this app release');
  return response;
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const alreadyExists = (await caches.keys()).includes(CACHE_NAME);
    const cache = await caches.open(CACHE_NAME);
    if (alreadyExists) {
      // An active worker may share this exact snapshot. Never mutate or delete it
      // during installation of another worker.
      for (const { asset, url } of assetUrls.values()) {
        if (!await matchesAsset(await cache.match(url), asset)) {
          throw new Error(`Existing offline snapshot is incomplete: ${asset}`);
        }
      }
      return;
    }
    try {
      for (const { asset, url } of assetUrls.values()) {
        await cache.put(url, await downloadVerified(asset, url));
      }
    } catch (error) {
      await caches.delete(CACHE_NAME);
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
    if (await matchesAsset(await cache.match(url), asset)) continue;
    missing.push(asset);
    if (!downloadMissing) continue;
    try {
      await cache.put(url, await downloadVerified(asset, url));
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
      // A forced update controls every open tab. Reload them before removing the
      // old snapshot so that an old document cannot request new lazy-loaded data.
      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of clients) {
        // The initiating app reloads itself on controllerchange. Start legacy
        // tabs navigating, but do not await: their requests need activation to
        // finish before this worker can serve the new release.
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
    if (cached) return cached;
    try {
      // A missing file can be repaired without the UI, but only when the
      // server still has exactly the bytes belonging to this snapshot.
      const response = await downloadVerified(managedAsset.asset, managedAsset.url);
      await cache.put(managedAsset.url, response.clone());
      return response;
    } catch {
      return new Response('Offline app file unavailable. Retry the offline download.', {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
      });
    }
  })());
});
