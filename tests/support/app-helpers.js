const { expect } = require('@playwright/test');
const { randomUUID } = require('node:crypto');

async function setServerMode(request, mode) {
  const response = await request.post('/__test__/mode', { data: { mode } });
  expect(response.ok()).toBeTruthy();
  return response.json();
}

async function blockExternalRequests(context) {
  const appOrigin = `http://127.0.0.1:${process.env.TEST_PORT || 4173}`;
  await context.route('**/*', async (route) => {
    const requestUrl = new URL(route.request().url());
    if (requestUrl.origin === appOrigin) return route.continue();
    return route.abort();
  });
}

async function openApp(page, registration = 'SE-LTL') {
  const storageSessionId = randomUUID();
  await page.addInitScript(({ initialRegistration, storageSessionId }) => {
    if (sessionStorage.getItem('__testStorageSessionId') !== storageSessionId) {
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem('selected_reg', initialRegistration);
      sessionStorage.setItem('__testStorageSessionId', storageSessionId);
    }
    const nativeAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function (type, listener, options) {
      if (this === document && type === 'DOMContentLoaded' && listener?.name === 'init') {
        const observedInit = function (event) {
          window.__testAppInitPromise = Promise.resolve(listener.call(this, event))
            .then(() => true, (error) => {
              window.__testAppInitError = String(error?.stack || error);
              return false;
            });
          return window.__testAppInitPromise;
        };
        return nativeAddEventListener.call(this, type, observedInit, options);
      }
      return nativeAddEventListener.call(this, type, listener, options);
    };
  }, { initialRegistration: registration, storageSessionId });
  await page.goto('/');
  await expect(page.locator('#global-registration')).toHaveValue(registration);
  await page.waitForFunction(() => {
    return Boolean(window.__testAppInitPromise);
  }, null, { timeout: 30_000 });
  await page.evaluate(() => window.__testAppInitPromise);
}

async function chooseAirport(page, prefix, icao, runway) {
  const input = page.locator(`#${prefix}-airport-icao`);
  await input.fill(icao);
  const runwaySelect = page.locator(`#${prefix}-airport-rwy`);
  await expect(runwaySelect.locator(`option[value="${runway}"]`)).toHaveCount(1);
  await runwaySelect.selectOption(runway);
  await expect(input).toHaveValue(icao);

  // Airport selection starts an asynchronous METAR request. Let it finish before
  // the test enters fixed weather values, so a late response cannot change them.
  const metarStatus = page.locator(`#${prefix}-runway-suggestion-text`);
  await expect(metarStatus).not.toHaveText('', { timeout: 10_000 });
  await expect(metarStatus).not.toContainText('Checking METAR wind', { timeout: 20_000 });
}

async function fillWeather(page, prefix, { direction = '020', speed = '5', oat = '15', qnh = '1013' } = {}) {
  await page.locator(`#${prefix}-wind-dir`).fill(direction);
  await page.locator(`#${prefix}-wind-spd`).fill(speed);
  await page.locator(`#${prefix}-oat`).fill(oat);
  await page.locator(`#${prefix}-qnh`).fill(qnh);
}

async function loadC56xPerformanceData(page) {
  await page.goto('/');
  await page.addScriptTag({ url: '/data/c56x/index.js' });
  await page.evaluate(() => window.C56XPerformanceDataReady);
}

module.exports = {
  blockExternalRequests,
  chooseAirport,
  fillWeather,
  loadC56xPerformanceData,
  openApp,
  setServerMode,
};
