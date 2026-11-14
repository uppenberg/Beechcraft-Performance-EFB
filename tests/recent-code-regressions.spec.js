const { test, expect } = require('./support/coverage-test');
const { blockExternalRequests, chooseAirport, openApp, setServerMode } = require('./support/app-helpers');

test.use({ serviceWorkers: 'block' });

test.beforeEach(async ({ context, request }) => {
  await setServerMode(request, 'normal');
  await blockExternalRequests(context);
});

test('Live Server detection is limited to its development port', async ({ page }) => {
  await openApp(page, 'SE-LTL');
  const result = await page.evaluate(() => {
    const isLocal = BeechcraftApp.offline.isLocalDevelopmentHost;
    return {
      liveServer: isLocal({ hostname: '127.0.0.1', port: '5500' }),
      testServer: isLocal({ hostname: '127.0.0.1', port: '4173' }),
      otherDevServer: isLocal({ hostname: 'localhost', port: '8080' }),
    };
  });
  expect(result).toEqual({ liveServer: true, testServer: false, otherDevServer: false });
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

for (const registration of ['SE-LTL', 'SE-MHU', 'SE-RIJ']) {
  test(`${registration}: OEI warning follows the selected takeoff runway and clears with the selection`, async ({ page }) => {
    await openApp(page, registration);
    await expect(page.locator('main')).toBeVisible();
    await page.evaluate(() => {
      const { airports, state: { AppState } } = BeechcraftApp;
      const base = airports.getAirportRows('ESSA').find(row => row.RWY === '01L' && !row.Intersection);
      const cases = [
        { RWY: '01', gradient: 3.3, routing: '' },
        { RWY: '02', gradient: 3.3, routing: 'Test routing' },
        { RWY: '03', gradient: 3.2, routing: '' },
        { RWY: '04', gradient: 3.3, routing: '-' },
      ];
      AppState.globalData.airports = AppState.globalData.airports.concat(cases.map(({ RWY, gradient, routing }) => ({
        ...base, ICAO: 'ZZZZ', RWY,
        'min climb gradient OEI(I6)': gradient,
        'Routing(L6)': routing,
      })));
    });
    const warning = page.locator('#to-oei-routing-warning');
    await expect(warning).toBeHidden();
    await chooseAirport(page, 'to', 'ZZZZ', '01');
    await expect(warning).toBeVisible();
    await page.locator('#to-airport-rwy').selectOption('02');
    await expect(warning).toBeHidden();
    await page.locator('#to-airport-rwy').selectOption('03');
    await expect(warning).toBeHidden();
    await page.locator('#to-airport-rwy').selectOption('04');
    await expect(warning).toBeVisible();
    await page.locator('#to-airport-rwy').selectOption('');
    await expect(warning).toBeHidden();
  });
}
