const { test, expect } = require('./support/coverage-test');
const { blockExternalRequests, openApp, setServerMode } = require('./support/app-helpers');

test.use({ serviceWorkers: 'block' });

test.beforeEach(async ({ context, request }) => {
  await setServerMode(request, 'normal');
  await blockExternalRequests(context);
});

test('local development disables service worker updates and offline checks', async ({ page }) => {
  await openApp(page, 'SE-LTL');
  await expect(page.locator('#check-updates-button')).toBeDisabled();
  await expect(page.locator('#offline-data-retry')).toBeDisabled();
  const result = await page.evaluate(async () => {
    const registered = await BeechcraftApp.offline.registerAppServiceWorker();
    let offlineError = '';
    try {
      await BeechcraftApp.offline.getOfflineDataWorker();
    } catch (error) {
      offlineError = error.message;
    }
    return { registered, offlineError };
  });
  expect(result).toEqual({ registered: undefined, offlineError: 'Offline file checks are unavailable while using Live Server.' });
});

test('METAR display color follows observation age after render', async ({ page }) => {
  await openApp(page, 'SE-LTL');
  const display = page.locator('#to-metar-display');
  await page.evaluate(() => {
    const element = document.querySelector('#to-metar-display');
    element.dataset.metarObservedAt = String(Date.now() - 34 * 60_000);
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(display).toHaveCSS('color', 'rgb(63, 185, 80)');

  await page.evaluate(() => {
    const element = document.querySelector('#to-metar-display');
    element.dataset.metarObservedAt = String(Date.now() - 36 * 60_000);
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(display).toHaveCSS('color', 'rgb(210, 153, 34)');

  await page.evaluate(() => {
    const element = document.querySelector('#to-metar-display');
    element.dataset.metarObservedAt = String(Date.now() - 61 * 60_000);
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(display).toHaveCSS('color', 'rgb(248, 81, 73)');
});

test('transient empty registration restores the saved supported aircraft', async ({ page }) => {
  await openApp(page, 'SE-LTL');
  const result = await page.evaluate(() => {
    localStorage.setItem('selected_reg', 'SE-LTL');
    BeechcraftApp.aircraft.handleRegistrationChange('');
    return document.querySelector('#global-registration').value;
  });
  expect(result).toBe('SE-LTL');
});
