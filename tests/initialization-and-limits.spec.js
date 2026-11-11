const { test, expect } = require('./support/coverage-test');
const { openApp, blockExternalRequests, chooseAirport, fillWeather, setServerMode } = require('./support/app-helpers');

test.use({ serviceWorkers: 'block' });

test.beforeEach(async ({ context, request }) => {
  await setServerMode(request, 'normal');
  await blockExternalRequests(context);
});

test('performance stays hidden until the workbook and visible inputs are synchronized', async ({ page }) => {
  let release;
  let started;
  const gate = new Promise((resolve) => { release = resolve; });
  const requested = new Promise((resolve) => { started = resolve; });
  await page.route('**/data/se-ltl.xlsx', async (route) => {
    started();
    await gate;
    await route.continue();
  });
  const opening = openApp(page, 'SE-LTL');
  await requested;
  await expect(page.locator('main')).toBeHidden();
  await expect(page.locator('#initialization-status')).toBeVisible();
  await expect(page.locator('#global-registration')).toBeDisabled();
  release();
  await opening;
  await expect(page.locator('main')).toBeVisible();
  await expect(page.locator('#global-registration')).toBeEnabled();
  await expect(page.locator('#initialization-status')).toHaveCount(0);
});

test('version.js is the single release marker and does not block calculator startup', async ({ page }) => {
  await page.route('**/version.js', (route) => route.fulfill({
    status: 200, contentType: 'text/javascript', body: "self.APP_VERSION = 'test-release';",
  }));
  await page.goto('/');
  await expect(page.locator('main')).toBeVisible();
  await expect(page.locator('#app-version')).toContainText('test-release');
  await expect(page.locator('#initialization-status')).toHaveCount(0);
});

test('limit decisions reject missing data and use unrounded boundaries', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(async () => {
    const { finiteNumber, exceedsDistanceLimit, windLimitStatus } = await import('./js/performance-limits.js');
    return {
      invalid: [null, undefined, '', '#ERROR!', Infinity, {}, [], true].map(finiteNumber),
      distance: [99.99, 100, 100.01].map((value) => exceedsDistanceLimit(value, 100)),
      missing: exceedsDistanceLimit(100, ''),
      wind: [
        windLimitStatus(0, 25, 25),
        windLimitStatus(0, 25.01, 25),
        windLimitStatus(-10, 0, 25),
        windLimitStatus(-10.01, 0, 25),
      ],
    };
  });
  expect(result.invalid).toEqual(Array(8).fill(null));
  expect(result.distance).toEqual([false, false, true]);
  expect(result.missing).toBeNull();
  expect(result.wind).toEqual(['normal', 'red', 'amber', 'red']);
});

for (const registration of ['SE-LTL', 'SE-KVL', 'SE-MJU', 'SE-MHU', 'SE-MJV', 'SE-RIJ']) {
  test(`${registration}: untouched startup has a consistent engine and visible inputs`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await openApp(page, registration);
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('#airport-selection-error')).not.toContainText('Could not initialize');
    const state = await page.evaluate(() => {
      const app = BeechcraftApp;
      const registration = document.getElementById('global-registration').value;
      const aircraft = app.state.AIRCRAFT_REGISTRATIONS[registration];
      const controls = {
        takeoff: { mass: 'to-mass', rwcc: 'to-rwcc', flaps: 'to-flaps', antiIce: 'to-anti-ice', windDir: 'to-wind-dir', windSpeed: 'to-wind-spd', oat: 'to-oat', qnh: 'to-qnh' },
        landing: { mass: 'ldg-mass', rwcc: 'ldg-rwcc', windDir: 'ldg-wind-dir', windSpeed: 'ldg-wind-spd', oat: 'ldg-oat', qnh: 'ldg-qnh' },
      };
      if (aircraft.type === 'B190') controls.takeoff.technique = 'to-technique';
      const entries = [];
      if (aircraft.performanceEngine === 'workbook') {
        for (const [type, fields] of Object.entries(controls)) {
          const config = app.state.CELL_MAPPING[type];
          for (const [field, id] of Object.entries(fields)) {
            entries.push({ field: `${type}.${field}`, ui: document.getElementById(id).value,
              engine: app.workbookEngine.getOutputVal(config.sheetName, config.inputs[field], false) });
          }
        }
      }
      return { engine: aircraft.performanceEngine, hasWorkbook: Boolean(app.state.AppState.hfInstance), entries };
    });
    if (registration === 'SE-RIJ') {
      expect(state.engine).toBe('c56x');
      expect(state.hasWorkbook).toBe(false);
      await expect(page.locator('#to-mass')).toHaveValue('20000');
      await expect(page.locator('#ldg-mass')).toHaveValue('18700');
      await expect(page.locator('#to-anti-ice')).toHaveValue('ON');
    } else {
      expect(state.engine).toBe('workbook');
      expect(state.hasWorkbook).toBe(true);
      for (const { field, ui, engine } of state.entries) {
        if (ui === '') {
          expect(typeof engine === 'object' || engine === '-', field).toBeTruthy();
        } else {
          expect(String(engine), field).toBe(ui);
        }
      }
    }
    expect(errors).toEqual([]);
  });
}

for (const [registration, mass] of [['SE-LTL', '11500'], ['SE-MHU', '15000'], ['SE-RIJ', '17000']]) {
  test(`${registration}: saved inputs restore to the selected engine`, async ({ page }) => {
    await openApp(page, registration);
    await page.locator('#to-mass').evaluate((element, next) => {
      element.value = next;
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }, mass);
    await page.locator('#to-rwcc').selectOption('4');
    await page.reload();
    await page.waitForFunction(() => Boolean(window.__testAppInitPromise));
    await page.evaluate(() => window.__testAppInitPromise);
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('#to-mass')).toHaveValue(mass);
    await expect(page.locator('#to-rwcc')).toHaveValue('4');
    if (registration !== 'SE-RIJ') {
      const values = await page.evaluate(() => ({
        mass: BeechcraftApp.workbookEngine.getOutputVal('Take-off', 'C14', false),
        rwcc: BeechcraftApp.workbookEngine.getOutputVal('Take-off', 'C10', false),
      }));
      expect(String(values.mass)).toBe(mass);
      expect(String(values.rwcc)).toBe('4');
    }
  });
}

test('precision decisions and displayed rounding agree at runway limits', async ({ page }) => {
  await openApp(page, 'SE-LTL');
  const result = await page.evaluate(() => {
    const app = BeechcraftApp;
    const hf = app.state.AppState.hfInstance;
    const sheet = hf.getSheetId('Take-off');
    for (const [ref, value] of Object.entries({ C35: 1000.4, C20: 1000, C24: -10.4, C25: 25.4, F25: 25 })) {
      const position = app.workbookEngine.parseCellRef(ref);
      hf.setCellContents({ sheet, ...position }, [[value]]);
    }
    app.workbookEngine.refreshOutputs();
    return {
      badge: document.getElementById('badge-tor').textContent,
      status: document.getElementById('takeoff-exceedance-status').textContent,
      distance: document.getElementById('check-tor-val').textContent,
      limit: document.getElementById('check-tora-val').textContent,
      wind: document.getElementById('card-wind-check').textContent.replace(/\s+/g, ' ').trim(),
      windBorder: document.getElementById('card-wind-check').style.borderColor,
    };
  });
  expect(result.badge).toBe('FAIL');
  expect(result.status).toContain('TOR Exceeded');
  expect(result.distance).toBe('1000');
  expect(result.limit).toBe('1000');
  expect(result.wind).toContain('-10 | 25 (25)');
  expect(result.windBorder).toBe('rgb(248, 81, 73)');
});

for (const registration of ['SE-LTL', 'SE-MHU', 'SE-RIJ']) {
  test(`${registration}: wind cards compare exact values and show rounded values`, async ({ page }) => {
    await openApp(page, registration);
    const result = await page.evaluate(() => {
      const results = BeechcraftApp.results;
      results.updateWindCheckCard(0, 25.4, 25);
      results.updateWindCheckCardLdg(-10.4, 0, 25);
      return ['to', 'ldg'].map((prefix) => ({
        wind: document.getElementById(`res-${prefix}-hwtw`).textContent,
        crosswind: document.getElementById(`res-${prefix}-xw`).textContent,
        color: document.getElementById(`card-wind-check${prefix === 'ldg' ? '-ldg' : ''}`).style.borderColor,
      }));
    });
    expect(result).toEqual([
      { wind: '0', crosswind: '25', color: 'rgb(248, 81, 73)' },
      { wind: '-10', crosswind: '0', color: 'rgb(248, 81, 73)' },
    ]);
  });
}

test('C56X compares actual takeoff and landing distances before rounding their display', async ({ page }) => {
  await openApp(page, 'SE-RIJ');
  await chooseAirport(page, 'to', 'ESSA', '01L');
  await fillWeather(page, 'to', { direction: '020', speed: '8', oat: '0', qnh: '1013' });
  await page.locator('#to-flaps').selectOption('15');
  await page.locator('#to-mass').evaluate((control) => {
    control.value = '17500';
    control.dispatchEvent(new Event('input', { bubbles: true }));
  });
  const takeoff = await page.evaluate(() => {
    const airport = BeechcraftApp.airports.getSelectedAirportRecord('to');
    const raw = getC56xTakeoffFieldLengths({
      qnhHpa: 1013, fieldElevationFt: Number(airport['RWY Elev [ft] (B6)']),
      oatC: 0, weightLb: 17500, windDirectionDeg: 20, windSpeedKnots: 8,
      runwayHeadingDeg: Number(airport['RWYHDG [°](H6)']),
      runwaySlopePercent: Number(airport['Slope [%](G6)']), runwayConditionCode: '6',
      reverserStatus: 'AVAILABLE', antiIce: 'ON', flaps: 15, deiceFluidApplied: false,
    }).selectedDistanceFt * 0.3048;
    const read = () => ({
      badge: document.getElementById('c56x-badge-tora').textContent,
      marker: document.getElementById('tor-marker').dataset.val,
    });
    airport['TORA [m] (C6)'] = String(raw + 0.01);
    BeechcraftApp.c56x.updateC56xTakeoffFieldLength();
    const within = read();
    airport['TORA [m] (C6)'] = String(raw - 0.01);
    BeechcraftApp.c56x.updateC56xTakeoffFieldLength();
    return { raw, within, exceeded: read() };
  });
  expect(takeoff.within.badge).toBe('OK');
  expect(takeoff.exceeded.badge).toBe('FAIL');
  expect(takeoff.within.marker).toBe(String(Math.ceil(takeoff.raw)));

  await page.locator('#landing-tab-button').click();
  await chooseAirport(page, 'ldg', 'ESSA', '01L');
  await fillWeather(page, 'ldg', { direction: '020', speed: '8', oat: '15', qnh: '1013' });
  await page.locator('#ldg-mass').evaluate((control) => {
    control.value = '17000';
    control.dispatchEvent(new Event('input', { bubbles: true }));
  });
  const landing = await page.evaluate(() => {
    const airport = BeechcraftApp.airports.getSelectedAirportRecord('ldg');
    const direction = Number(airport['RWYHDG [°](H6)']);
    const headwind = 8 * Math.cos((((20 - direction + 540) % 360) - 180) * Math.PI / 180);
    const raw = getC56xLandingPerformance({
      qnhHpa: 1013, fieldElevationFt: Number(airport['RWY Elev [ft] (B6)']),
      oatC: 15, weightLb: 17000, headwindKnots: headwind,
      runwaySlopePercent: Number(airport['Slope [%](G6)']), runwayConditionCode: '6',
      antiIce: 'OFF', reverserStatus: 'AVAILABLE',
    }).requiredDistanceFt * 0.3048;
    const read = () => ({
      status: document.getElementById('landing-exceedance-status').textContent,
      marker: document.getElementById('ldg-dist-down-marker').dataset.val,
    });
    airport['LDA [m](F6)'] = String(raw + 0.01);
    BeechcraftApp.workbookEngine.updateC56xLanding();
    const within = read();
    airport['LDA [m](F6)'] = String(raw - 0.01);
    BeechcraftApp.workbookEngine.updateC56xLanding();
    return { raw, within, exceeded: read() };
  });
  expect(landing.within.status).toContain('Within limits');
  expect(landing.exceeded.status).toContain('Exceeds LDA');
  expect(landing.within.marker).toBe(String(Math.ceil(landing.raw)));
});
