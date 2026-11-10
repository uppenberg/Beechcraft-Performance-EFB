const { test, expect } = require('@playwright/test');
test.use({ serviceWorkers: 'block' });

const {
  blockExternalRequests,
  openApp,
  setServerMode,
} = require('./support/app-helpers');

test.beforeEach(async ({ context, request }) => {
  await setServerMode(request, 'normal');
  await blockExternalRequests(context);
});

test('malformed saved inputs and METAR do not prevent startup or later input', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await openApp(page, 'SE-LTL');

  await page.evaluate(() => {
    localStorage.setItem('selected_to_airport_icao', 'ESSA');
    localStorage.setItem('selected_to_airport_runway', '01L');
    localStorage.setItem('selected_to_airport_intersection', '');
    localStorage.setItem('saved_metar_to_ESSA', '{ definitely not JSON');
    localStorage.setItem(BeechcraftApp.state.getPersistedFormStateKey(), '{ definitely not JSON');
  });
  await page.reload();
  await page.waitForFunction(() => Boolean(window.__testAppInitPromise));
  await page.evaluate(() => window.__testAppInitPromise);

  await expect(page.locator('#airport-selection-error')).not.toContainText('Could not initialize');
  await expect(page.locator('#to-airport-icao')).toHaveValue('ESSA');
  await expect(page.locator('#to-airport-rwy')).toHaveValue('01L');
  await page.locator('#to-wind-spd').fill('11');
  await expect(page.locator('#to-wind-spd')).toHaveValue('11');
  expect(pageErrors).toEqual([]);
});

test('rapid tab changes and malformed/extreme numeric input leave the calculator responsive', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await openApp(page, 'SE-LTL');

  await page.evaluate(() => {
    const fields = [
      document.getElementById('to-wind-dir'),
      document.getElementById('to-wind-spd'),
      document.getElementById('to-oat'),
      document.getElementById('to-qnh'),
    ];
    const values = ['', 'NaN', 'Infinity', '-999999999', '1e309', '999999999'];
    for (let index = 0; index < 60; index += 1) {
      fields.forEach((field, fieldIndex) => {
        field.value = values[(index + fieldIndex) % values.length];
        field.dispatchEvent(new Event('input', { bubbles: true }));
      });
      BeechcraftApp.airports.switchTab(index % 2 ? 'landing' : 'takeoff');
    }
  });

  await page.locator('.tab-btn').first().click();
  await page.locator('#to-wind-dir').fill('20');
  await page.locator('#to-wind-spd').fill('8');
  await page.locator('#to-oat').fill('15');
  await page.locator('#to-qnh').fill('1013');
  await page.locator('#landing-tab-button').click();
  await expect(page.locator('#page-landing')).toBeVisible();
  await page.locator('.tab-btn').first().click();
  await expect(page.locator('#page-takeoff')).toBeVisible();
  await expect(page.locator('#to-wind-spd')).toHaveValue('8');
  expect(pageErrors).toEqual([]);
});

test('a corrupt workbook shows a recoverable initialization error and reload succeeds', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.route('**/data/se-ltl.xlsx', (route) => route.fulfill({
    status: 200,
    contentType: 'application/octet-stream',
    body: 'This is not an XLSX workbook.',
  }));

  await openApp(page, 'SE-LTL');
  await expect(page.locator('#airport-selection-error'))
    .toContainText('Could not initialize the performance calculator');
  await expect(page.locator('main')).toBeHidden();
  await expect.poll(() => page.evaluate(() => BeechcraftApp.state.AppState.appInitializationFailed))
    .toBeTruthy();

  await page.unroute('**/data/se-ltl.xlsx');
  await page.reload();
  await page.waitForFunction(() => Boolean(window.__testAppInitPromise));
  await page.evaluate(() => window.__testAppInitPromise);
  await expect.poll(() => page.evaluate(() => BeechcraftApp.state.AppState.appInitializationFailed))
    .toBeFalsy();
  await expect(page.locator('#airport-selection-error')).not.toContainText('Could not initialize');
  expect(pageErrors).toEqual([]);
});

test('a late METAR response for the previous airport is ignored', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await openApp(page, 'SE-LTL');

  let releaseOldResponse;
  let signalOldRequest;
  const oldResponseGate = new Promise((resolve) => { releaseOldResponse = resolve; });
  const oldRequestStarted = new Promise((resolve) => { signalOldRequest = resolve; });
  await page.route('**/api/reports/metar**', async (route) => {
    const url = new URL(route.request().url());
    const icao = url.searchParams.get('ids');
    const now = new Date();
    const observationTime = [
      String(now.getUTCDate()).padStart(2, '0'),
      String(now.getUTCHours()).padStart(2, '0'),
      String(now.getUTCMinutes()).padStart(2, '0'),
    ].join('');
    const body = `METAR ${icao} ${observationTime}Z 02008KT 15/10 Q1013`;
    if (icao === 'ESSA') {
      signalOldRequest();
      await oldResponseGate;
    }
    await route.fulfill({ status: 200, contentType: 'text/plain', body });
  });

  await page.locator('#to-airport-icao').fill('ESSA');
  await page.locator('#to-airport-rwy').selectOption('01L');
  await oldRequestStarted;

  await page.locator('#to-airport-icao').fill('ESMS');
  const runwaySelect = page.locator('#to-airport-rwy');
  await expect(runwaySelect.locator('option[value="17"]')).toHaveCount(1);
  await runwaySelect.selectOption('17');
  await expect(page.locator('#to-metar-display')).toContainText('ESMS');

  releaseOldResponse();
  await expect(page.locator('#to-metar-display')).toContainText('ESMS');
  await expect(page.locator('#to-metar-display')).not.toContainText('ESSA');
  expect(pageErrors).toEqual([]);
});

test('negative wind speeds are rejected on both tabs without changing calculator inputs', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await openApp(page, 'SE-LTL');

  for (const prefix of ['to', 'ldg']) {
    if (prefix === 'ldg') await page.locator('#landing-tab-button').click();
    const windSpeed = page.locator(`#${prefix}-wind-spd`);
    await windSpeed.fill('8');
    await windSpeed.focus();
    await page.keyboard.press('Control+A');
    await page.keyboard.type('-2');
    await expect(windSpeed).toHaveValue('8');
    await expect(windSpeed).toHaveAttribute('aria-invalid', 'true');

    await windSpeed.fill('-3');
    await expect(windSpeed).toHaveValue('8');
    await windSpeed.fill('6');
    await expect(windSpeed).toHaveValue('6');
    await expect(windSpeed).not.toHaveAttribute('aria-invalid', 'true');
  }

  const workbookWindValues = await page.evaluate(() => {
    const config = BeechcraftApp.state.CELL_MAPPING;
    const instance = BeechcraftApp.state.AppState.hfInstance;
    return ['takeoff', 'landing'].map((pageName) => {
      const sheetConfig = config[pageName];
      const sheet = instance.getSheetId(sheetConfig.sheetName);
      const { col, row } = BeechcraftApp.workbookEngine.parseCellRef(
        sheetConfig.inputs.windSpeed
      );
      return instance.getCellValue({ sheet, col, row });
    });
  });
  expect(workbookWindValues).toEqual([6, 6]);
  expect(pageErrors).toEqual([]);
});
