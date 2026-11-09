const { test, expect } = require('@playwright/test');
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

test('offline asset installation verifies all app, workbook and C56X files', async ({ page }) => {
  await openApp(page, 'SE-LTL');
  await waitForOfflineReady(page);
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
  await expect(await request.get('/sw.js').then((response) => response.text()))
    .toContain('Playwright update marker');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 45_000 }),
    page.locator('#check-updates-button').click(),
  ]);
  await page.waitForFunction(() => Boolean(window.__testAppInitPromise));
  await page.evaluate(() => window.__testAppInitPromise);
  await expect(page.locator('#global-registration')).toHaveValue('SE-LTL');
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  await waitForOfflineReady(page);
});
