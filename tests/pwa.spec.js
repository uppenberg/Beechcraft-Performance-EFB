const { test, expect } = require('./support/coverage-test');
const { blockExternalRequests, openApp, setServerMode } = require('./support/app-helpers');

test.beforeEach(async ({ browserName, context, request }) => {
  test.skip(browserName !== 'chromium', 'Service-worker lifecycle checks run in Chromium; WebKit covers app UI and calculation compatibility.');
  await setServerMode(request, 'normal');
  await blockExternalRequests(context);
});

async function openSettings(page) {
  const toggle = page.locator('#settings-toggle');
  if (await toggle.getAttribute('aria-expanded') !== 'true') await toggle.click();
}

async function waitForOfflineReady(page) {
  await expect(page.locator('#offline-data-status')).toContainText(
    /All \d+(?: app and performance)? files are available offline/,
    { timeout: 45_000 }
  );
}

test('offline asset installation downloads the complete current release', async ({ page }) => {
  await openApp(page, 'SE-LTL');
  await waitForOfflineReady(page);
  const snapshot = await page.evaluate(async () => {
    const name = (await caches.keys()).find((item) => item === `be20-efb-v${window.APP_VERSION}`);
    const cache = await caches.open(name);
    return { name, count: (await cache.keys()).length };
  });
  expect(snapshot.name).toBe(`be20-efb-v${await page.evaluate(() => window.APP_VERSION)}`);
  expect(snapshot.count).toBeGreaterThanOrEqual(40);
  await openSettings(page);
  await expect(page.locator('#offline-data-status')).toHaveClass(/is-ready/);
  await expect(page.locator('#offline-data-retry')).toBeEnabled();
});

test('failed workbook download reports failure, enables retry and recovers after reconnecting', async ({ page, request }) => {
  await setServerMode(request, 'fail-workbook');
  await openApp(page, 'SE-LTL');
  await expect(page.locator('#airport-selection-error')).toContainText('Could not initialize the performance calculator');
  await openSettings(page);

  await page.locator('#offline-data-retry').click();
  await expect(page.locator('#offline-data-status')).toHaveClass(/is-error/, { timeout: 30_000 });
  await expect(page.locator('#offline-data-retry')).toBeEnabled();

  await setServerMode(request, 'normal');
  await page.locator('#offline-data-retry').click();
  await waitForOfflineReady(page);
  await expect(page.locator('#offline-app-reload')).toBeVisible();
  await page.locator('#offline-app-reload').click();
  await expect(page.locator('#airport-selection-error')).not.toContainText('Could not initialize');
  await waitForOfflineReady(page);
});

test('installed app starts offline and reconnects for update checks', async ({ page, context }) => {
  await openApp(page, 'SE-RIJ');
  await waitForOfflineReady(page);
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);

  await context.setOffline(true);
  await page.reload();
  await page.waitForFunction(() => Boolean(window.__testAppInitPromise));
  await page.evaluate(() => window.__testAppInitPromise);
  await expect(page.locator('#global-registration')).toHaveValue('SE-RIJ');
  await expect(page.locator('#c56x-takeoff-performance')).toBeVisible();
  await expect(page.locator('#c56x-tora-status')).toContainText('Not available');

  await context.setOffline(false);
  await openSettings(page);
  await page.locator('#check-updates-button').click();
  await expect(page.locator('#update-status')).toContainText('already up to date', { timeout: 30_000 });
});

test('service worker update can be detected, installed and activated', async ({ page, request }) => {
  await openApp(page, 'SE-LTL');
  await waitForOfflineReady(page);
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  await openSettings(page);

  await setServerMode(request, 'updated');
  await page.reload();
  await page.waitForFunction(() => Boolean(window.__testAppInitPromise));
  await page.evaluate(() => window.__testAppInitPromise);
  await openSettings(page);
  await expect(page.locator('#app-version')).toContainText('test-release');
  await expect.poll(() => page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    return Boolean(registration.waiting);
  }), { timeout: 30_000 }).toBe(true);
  const activate = page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    BeechcraftApp.offline.activateAppUpdate(registration.waiting);
  });
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 45_000 }),
    activate,
  ]);
  await page.waitForFunction(() => Boolean(window.__testAppInitPromise));
  await page.evaluate(() => window.__testAppInitPromise);
  await expect(page.locator('#global-registration')).toHaveValue('SE-LTL');
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  await waitForOfflineReady(page);
});

test('version.js selects a new cache while the old app shell remains active until update', async ({ page, request }) => {
  await openApp(page, 'SE-LTL');
  await waitForOfflineReady(page);
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  const oldVersion = await page.evaluate(() => window.APP_VERSION);
  const { updateMarker } = await setServerMode(request, 'updated');
  await page.reload();
  await page.waitForFunction(() => Boolean(window.__testAppInitPromise));
  await page.evaluate(() => window.__testAppInitPromise);
  await openSettings(page);
  expect(await page.evaluate(() => ({
    version: window.APP_VERSION,
    html: document.querySelector('meta[name="test-release"]')?.content || null,
    script: window.__testRelease || null,
  }))).toEqual({ version: `test-release-${updateMarker}`, html: null, script: null });
  expect(await page.evaluate(() => window.APP_VERSION)).not.toBe(oldVersion);

  await expect.poll(() => page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    await registration.update();
    return Boolean(registration.waiting);
  }), { timeout: 30_000 }).toBe(true);
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 45_000 }),
    page.evaluate(async () => {
      const registration = await navigator.serviceWorker.getRegistration();
      BeechcraftApp.offline.activateAppUpdate(registration.waiting);
    }),
  ]);
  await expect.poll(() => page.evaluate(() => ({
    version: window.APP_VERSION,
    html: document.querySelector('meta[name="test-release"]')?.content || null,
    script: window.__testRelease || null,
  })), { timeout: 30_000 }).toEqual({ version: `test-release-${updateMarker}`, html: String(updateMarker), script: updateMarker });
});

test('a forced update moves other open tabs to the same versioned release', async ({ page, context, request }) => {
  await openApp(page, 'SE-LTL');
  await waitForOfflineReady(page);
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  const second = await context.newPage();
  await second.goto('/');
  await expect(second.locator('main')).toBeVisible();
  const { updateMarker } = await setServerMode(request, 'updated');
  await page.reload();
  await page.waitForFunction(() => Boolean(window.__testAppInitPromise));
  await page.evaluate(() => window.__testAppInitPromise);
  await expect.poll(() => page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    await registration.update();
    return Boolean(registration.waiting);
  }), { timeout: 30_000 }).toBe(true);
  // Activating the worker makes every already-controlled tab reload. Wait for
  // the second tab's navigation before evaluating its new document context.
  const secondReload = second.waitForEvent('load', { timeout: 30_000 });
  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    BeechcraftApp.offline.activateAppUpdate(registration.waiting);
  });
  await secondReload;
  await expect.poll(() => second.evaluate(() => ({
    version: window.APP_VERSION,
    html: document.querySelector('meta[name="test-release"]')?.content || null,
    script: window.__testRelease || null,
  })), { timeout: 30_000 }).toEqual({ version: `test-release-${updateMarker}`, html: String(updateMarker), script: updateMarker });
  await expect(second.locator('main')).toBeVisible();
});

test('a failed update retains the previously usable offline snapshot', async ({ page, request, context }) => {
  await openApp(page, 'SE-LTL');
  await waitForOfflineReady(page);
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  const oldVersion = await page.evaluate(() => window.APP_VERSION);
  await setServerMode(request, 'updated-broken');
  const installationState = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Update install timed out')), 30000);
      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed' || worker.state === 'redundant') {
            clearTimeout(timer);
            resolve(worker.state);
          }
        });
      }, { once: true });
      registration.update().catch(reject);
    });
  });
  expect(installationState).toBe('redundant');
  await context.setOffline(true);
  await page.reload();
  await page.waitForFunction(() => Boolean(window.__testAppInitPromise));
  await page.evaluate(() => window.__testAppInitPromise);
  expect(await page.evaluate(() => window.APP_VERSION)).toBe(oldVersion);
  await expect(page.locator('main')).toBeVisible();
  await waitForOfflineReady(page);
});

test('offline repair downloads a missing file into the selected release cache', async ({ page }) => {
  await openApp(page, 'SE-LTL');
  await waitForOfflineReady(page);
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  const result = await page.evaluate(async () => {
    const names = await caches.keys();
    const cache = await caches.open(names.find((name) => name.startsWith('be20-efb-v')));
    await cache.delete(new URL('./js/app.js', location.href));
    return BeechcraftApp.offline.requestOfflineDataWorkerMessage('RETRY_OFFLINE_DATA');
  });
  expect(result.ready).toBe(true);
  expect(result.missing).toEqual([]);
});

test('a missing cached file can be repaired from the current server release', async ({ page, request }) => {
  await openApp(page, 'SE-LTL');
  await waitForOfflineReady(page);
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  const file = './js/performance-limits.js';
  const removeAndFetch = () => page.evaluate(async (asset) => {
    const name = (await caches.keys()).find((item) => item.startsWith('be20-efb-v'));
    const cache = await caches.open(name);
    const url = new URL(asset, location.href);
    await cache.delete(url);
    const response = await fetch(url);
    return { status: response.status, cached: Boolean(await cache.match(url)) };
  }, file);
  expect(await removeAndFetch()).toEqual({ status: 200, cached: true });

  // A missing file can be fetched back into the current version cache.
  await setServerMode(request, 'updated');
  const changedFile = await page.evaluate(async () => {
    const name = (await caches.keys()).find((item) => item.startsWith('be20-efb-v'));
    const cache = await caches.open(name);
    const url = new URL('./js/app.js', location.href);
    await cache.delete(url);
    const response = await fetch(url);
    return { status: response.status, cached: Boolean(await cache.match(url)) };
  });
  expect(changedFile).toEqual({ status: 200, cached: true });
});
