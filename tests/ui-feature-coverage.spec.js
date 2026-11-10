const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const { blockExternalRequests, openApp, setServerMode } = require('./support/app-helpers');

test.use({ serviceWorkers: 'block' });

test.beforeEach(async ({ context, request }) => {
  await setServerMode(request, 'normal');
  await blockExternalRequests(context);
});

async function stubCurrentMetar(page) {
  const now = new Date();
  const observation = [
    String(now.getUTCDate()).padStart(2, '0'),
    String(now.getUTCHours()).padStart(2, '0'),
    String(now.getUTCMinutes()).padStart(2, '0'),
  ].join('');
  await page.route('**/api/reports/metar**', (route) => route.fulfill({
    status: 200,
    contentType: 'text/plain',
    body: `METAR EFHK ${observation}Z 02008KT 15/10 Q1013`,
  }));
}

test('all declared UI action names resolve to registered handlers', () => {
  const root = path.resolve(__dirname, '..');
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const app = fs.readFileSync(path.join(root, 'js/app.js'), 'utf8');
  const actionMap = app.match(/const uiActions = Object\.freeze\(\{([\s\S]*?)\n\}\);/);
  expect(actionMap, 'the UI action registry remains explicit').not.toBeNull();
  const registered = new Set([...actionMap[1].matchAll(/^\s*([A-Za-z_$][\w$]*):/gm)]
    .map((match) => match[1]));
  const declared = new Set();
  for (const match of html.matchAll(/data-action-(?:click|change|input|keydown|focus)="([^"]+)"/g)) {
    for (const descriptor of match[1].split(';')) {
      const name = descriptor.trim().split(':')[0];
      if (name) declared.add(name);
    }
  }
  expect([...declared].sort()).not.toEqual([]);
  expect([...declared].filter((name) => !registered.has(name)).sort()).toEqual([]);
  expect(html).not.toMatch(/\son(?:click|change|input|keydown|focus)=/i);
});

test('workbook formula conversion preserves supported formulas and cached unsupported formulas', async ({ page }) => {
  await openApp(page, 'SE-LTL');
  const result = await page.evaluate(() => {
    const data = BeechcraftApp.workbookData;
    const formula = data.normalizeFormulaForHyperFormula('IF(TRUE,INDEX(A1:C1,2),FALSE)');
    const quoted = data.normalizeFormulaForHyperFormula('IF(A1="INDEX(A1:C1,2)",TRUE,FALSE)');
    const worksheet = data.worksheetToHyperFormulaData({
      '!ref': 'A1:C2',
      A1: { t: 'n', v: 5 },
      B1: { f: 'TRUE', v: true },
      C1: { f: '_xlfn.CONCAT(A1,"x")', v: '5x' },
      A2: { t: 'e', w: '#VALUE!' },
    });
    return { formula, quoted, worksheet };
  });
  expect(result.formula).toBe('IF(TRUE(),INDEX(A1:C1,1,2),FALSE())');
  expect(result.quoted).toBe('IF(A1="INDEX(A1:C1,2)",TRUE(),FALSE())');
  expect(result.worksheet).toEqual([[5, '=TRUE()', '5x'], ['#VALUE!', null, null]]);
});

test('settings, guide navigation, update notice and ForeFlight link work', async ({ page }) => {
  await openApp(page, 'SE-LTL');

  const settings = page.locator('#settings-toggle');
  const panel = page.locator('#settings-panel');
  await settings.click();
  await expect(settings).toHaveAttribute('aria-expanded', 'true');
  await expect(panel).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
  await expect(settings).toBeFocused();

  await settings.click();
  await page.locator('#open-help-button').click();
  const guide = page.locator('#help-dialog');
  await expect(guide).toBeVisible();
  for (const section of ['help-overview', 'help-reg', 'help-settings', 'help-foreflight',
    'help-takeoff', 'help-landing', 'help-metar', 'help-runway', 'help-saved', 'help-install',
    'help-rwcc', 'help-eop', 'help-pitfalls']) {
    await expect(page.locator(`#${section}`), `${section} must exist in the in-app guide`).toHaveCount(1);
  }
  await page.locator('.help-toc a[href="#help-takeoff"]').click();
  await expect(page.locator('#help-takeoff')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(guide).toBeHidden();

  await page.evaluate(() => BeechcraftApp.offline.setUpdateAvailable(true));
  await expect(page.locator('#app-update-dialog')).toBeVisible();
  await page.locator('#app-update-later').click();
  await expect(page.locator('#app-update-dialog')).toBeHidden();
  await expect(settings).toHaveAttribute('aria-label', 'Open settings, update available');
  await page.evaluate(() => BeechcraftApp.offline.setOfflineDataStatus('Tested missing offline file.', 'error'));
  await expect(page.locator('#offline-data-status')).toHaveClass(/is-error/);
  await expect(page.locator('.open-foreflight-button')).toHaveAttribute('href', 'foreflightmobile://');
});

test('ICAO autocomplete supports keyboard selection and runway intersections update the selected record', async ({ page }) => {
  await openApp(page, 'SE-LTL');
  await stubCurrentMetar(page);
  const icao = page.locator('#to-airport-icao');
  await icao.fill('EFH');
  await expect(page.locator('#to-icao-suggestions [role="option"]')).toContainText(['EFHK']);
  await icao.press('ArrowDown');
  await expect(icao).toHaveAttribute('aria-activedescendant', /to-airport-icao-suggestion/);
  await icao.press('Enter');
  await expect(icao).toHaveValue('EFHK');
  await expect(icao).toHaveAttribute('aria-expanded', 'false');

  const runway = page.locator('#to-airport-rwy');
  await expect(runway.locator('option[value="04L"]')).toHaveCount(1);
  await runway.selectOption('04L');
  const intersectionRow = page.locator('#to-intersection-row');
  await expect(intersectionRow).toBeVisible();
  const intersection = page.locator('#to-airport-intersection');
  await expect(intersection.locator('option[value="WS"]')).toHaveCount(1);
  await intersection.selectOption('WS');
  const selected = await page.evaluate(() => ({
    selection: BeechcraftApp.state.AppState.airportSelection.to,
    record: BeechcraftApp.airports.getSelectedAirportRecord('to'),
  }));
  expect(selected.selection).toMatchObject({ icao: 'EFHK', runway: '04L', intersection: 'WS' });
  expect(selected.record.Intersection).toBe('WS');
  await expect(page.locator('#takeoff-runway-visualization-title')).toContainText('intersection WS');

  await icao.fill('ZZZZ');
  await expect(page.locator('#airport-selection-error')).toContainText('ICAO ZZZZ was not found');
  await expect(page.locator('#to-airport-rwy')).toHaveValue('');
});

test('METAR runway suggestion can be applied to takeoff and landing', async ({ page }) => {
  await openApp(page, 'SE-RIJ');
  await stubCurrentMetar(page);
  await page.locator('#to-airport-icao').fill('EFHK');
  await page.locator('#to-airport-rwy').selectOption('22R');
  await expect(page.locator('#to-runway-suggestion-text')).toContainText('METAR suggests RWY 04L');
  await page.evaluate(() => {
    BeechcraftApp.airports.suggestRunwayFromMetar('METAR EFHK 011230Z 02008KT 15/10 Q1013', 'to');
  });
  await expect(page.locator('#to-runway-suggestion-text')).toContainText('METAR suggests RWY 04L');
  const takeoffSuggestion = page.locator('#to-runway-suggestion-options .runway-suggestion-button')
    .filter({ hasText: 'Use RWY 04L, full runway' });
  await expect(takeoffSuggestion).toBeEnabled();
  await takeoffSuggestion.click();
  await expect(page.locator('#to-airport-rwy')).toHaveValue('04L');
  await expect(page.locator('#to-airport-intersection')).toHaveValue('');

  await page.locator('#landing-tab-button').click();
  await page.locator('#ldg-airport-icao').fill('EFHK');
  await page.locator('#ldg-airport-rwy').selectOption('22R');
  await expect(page.locator('#ldg-runway-suggestion-text')).toContainText('METAR suggests RWY 04L');
  await page.evaluate(() => {
    BeechcraftApp.airports.suggestRunwayFromMetar('METAR EFHK 011230Z 02008KT 15/10 Q1013', 'ldg');
  });
  await expect(page.locator('#ldg-runway-suggestion-text')).toContainText('METAR suggests RWY 04L');
  await page.getByRole('button', { name: 'Use RWY 04L' }).click();
  await expect(page.locator('#ldg-airport-rwy')).toHaveValue('04L');
});

test('custom-airport validation rejects invalid form values and duplicate runways update in place', async ({ page }) => {
  await openApp(page, 'SE-RIJ');
  await page.locator('#settings-toggle').click();
  await page.locator('#custom-airport-checkbox').check();
  await page.locator('#edit-custom-airports-button').click();

  const fields = {
    'ca-icao': 'ZZZ', 'ca-rwy': '09', 'ca-elev': '500', 'ca-tora': '200',
    'ca-toda': '200', 'ca-asda': '200', 'ca-lda': '200', 'ca-slope': '0',
    'ca-hdg': '90', 'ca-grad': '3.3',
  };
  for (const [id, value] of Object.entries(fields)) await page.locator(`#${id}`).fill(value);
  await expect(page.locator('#ca-icao')).toHaveAttribute('pattern', '[A-Za-z0-9]{4}');
  expect(await page.locator('#custom-airport-form').evaluate((form) => form.checkValidity())).toBe(false);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('custom_airports') || '[]'))).toEqual([]);

  await page.locator('#ca-icao').fill('zzzz');
  await page.locator('#ca-tora').fill('-1');
  expect(await page.locator('#custom-airport-form').evaluate((form) => form.checkValidity())).toBe(false);
  await page.locator('#ca-tora').fill('200');
  await page.locator('#ca-hdg').fill('361');
  expect(await page.locator('#custom-airport-form').evaluate((form) => form.checkValidity())).toBe(false);
  await page.locator('#ca-hdg').fill('90');
  await page.locator('#ca-turning').check();
  await page.locator('#custom-airport-form button[type="submit"]').click();
  await expect(page.locator('#custom-airport-list')).toContainText('ZZZZ RWY 09');
  await page.getByRole('button', { name: 'Edit' }).click();
  await page.locator('#ca-tora').fill('450');
  await page.locator('#custom-airport-form button[type="submit"]').click();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('custom_airports') || '[]'));
  expect(saved).toHaveLength(1);
  expect(saved[0]['TORA [m] (C6)']).toBe('450');
  expect(saved[0].ICAO).toBe('ZZZZ');
  expect(saved[0]['Engine out climb path']).toBe('Turning');
});

test('runway status cards, climb and wind cards, and chart markers render their states', async ({ page }) => {
  await openApp(page, 'SE-LTL');
  const state = await page.evaluate(() => {
    const app = BeechcraftApp;
    app.results.updateRunwayExceedanceCard('takeoff-exceedance-card', 'takeoff-exceedance-status', [
      { label: 'TOR', distance: 100, limit: 100 },
      { label: 'TOD', distance: 101, limit: 100 },
      { label: 'ASD', distance: 90, limit: 100 },
    ]);
    const exceeded = {
      status: document.getElementById('takeoff-exceedance-status').textContent,
      className: document.getElementById('takeoff-exceedance-card').className,
    };
    app.results.updateRunwayExceedanceCard('takeoff-exceedance-card', 'takeoff-exceedance-status', [
      { label: 'TOR', distance: null, limit: 100 },
    ]);
    const missing = document.getElementById('takeoff-exceedance-status').textContent;
    app.results.updateClimbCheckCard(2.04, 2.06);
    const climb = {
      actual: document.getElementById('res-to-oei').textContent,
      required: document.getElementById('res-to-req').textContent,
      border: document.getElementById('card-climb-check').style.borderColor,
    };
    app.results.updateWindCheckCard(-10.4, 25.4, 25);
    const wind = {
      headwind: document.getElementById('res-to-hwtw').textContent,
      crosswind: document.getElementById('res-to-xw').textContent,
      limit: document.getElementById('res-to-xwlimit').textContent,
      border: document.getElementById('card-wind-check').style.borderColor,
    };
    app.results.renderTakeoffChart(1000.4, 1100.4, 900.4, 1000, 1200, 950);
    const takeoff = ['tor', 'tod', 'asd'].map((name) => ({
      value: document.getElementById(`${name}-marker`).dataset.val,
      visible: !document.getElementById(`${name}-marker`).hidden,
    }));
    document.getElementById('ldg-flaps').value = 'UP';
    app.results.renderLandingChart(850.4, 920.4, 900);
    const landingUp = {
      marker: document.getElementById('ldg-dist-marker').dataset.val,
      upVisible: getComputedStyle(document.getElementById('ldg-dist-marker')).display !== 'none',
      downVisible: getComputedStyle(document.getElementById('ldg-dist-down-marker')).display !== 'none',
    };
    document.getElementById('ldg-flaps').value = 'DOWN';
    app.results.renderLandingChart(850.4, 920.4, 900);
    const landingDown = {
      marker: document.getElementById('ldg-dist-down-marker').dataset.val,
      upVisible: getComputedStyle(document.getElementById('ldg-dist-marker')).display !== 'none',
      downVisible: getComputedStyle(document.getElementById('ldg-dist-down-marker')).display !== 'none',
    };
    const path = app.airports.getC56xEngineOutClimbPath({ 'Engine out climb path': 'Straight' });
    app.airports.updateClimbPathLabel(path);
    const climbPath = document.getElementById('res-to-climb-path').textContent;
    const eop = [
      app.airports.getC56xEngineOutClimbPath({ 'Engine out climb path': 'Straight' }),
      app.airports.getC56xEngineOutClimbPath({ 'Engine out climb path': 'Turning' }),
      app.airports.getC56xEngineOutClimbPath({}),
    ];
    const runwayRows = app.airports.getAirportRows('EFHK');
    const candidate = runwayRows.find((airport) => airport.RWY === '04L' && !airport.Intersection);
    const incompleteRunway = app.airports.evaluateTakeoffRunwayAvailability({ RWY: '09' });
    const shortRunway = app.airports.evaluateTakeoffRunwayAvailability({
      ...candidate,
      'TORA [m] (C6)': '1', 'TODA [m](D6)': '1', 'ASDA [m](E6)': '1',
    });
    app.results.renderC56xTakeoffChart(1000.2, 900, 1000, 1100);
    const c56x = {
      takeoff: document.getElementById('tor-marker').dataset.val,
      todHidden: document.getElementById('tod-marker').hidden,
      asdHidden: document.getElementById('asd-marker').hidden,
    };
    return { exceeded, missing, climb, wind, takeoff, landingUp, landingDown, climbPath, eop, c56x, incompleteRunway, shortRunway };
  });

  expect(state.exceeded.status).toContain('TOD Exceeded');
  expect(state.exceeded.className).toContain('is-exceeded');
  expect(state.missing).toBe('Awaiting performance');
  expect(state.climb).toMatchObject({ actual: '2.0%', required: '2.1%', border: 'rgb(248, 81, 73)' });
  expect(state.wind).toMatchObject({ headwind: '-10', crosswind: '25', limit: '25' });
  expect(state.wind.border).toBe('rgb(248, 81, 73)');
  expect(state.takeoff).toEqual([
    { value: '1000', visible: true }, { value: '1100', visible: true }, { value: '900', visible: true },
  ]);
  expect(state.landingUp).toEqual({ marker: '850', upVisible: true, downVisible: false });
  expect(state.landingDown).toEqual({ marker: '920', upVisible: false, downVisible: true });
  expect(state.climbPath).toContain('Straight out');
  expect(state.eop.map(({ turning, assumed }) => ({ turning, assumed }))).toEqual([
    { turning: false, assumed: false },
    { turning: true, assumed: false },
    { turning: true, assumed: true },
  ]);
  expect(state.eop[0].label).toContain('Straight out');
  expect(state.eop[1].label).toContain('Turning climb');
  expect(state.eop[2].label).toContain('no airport data');
  expect(state.c56x).toEqual({ takeoff: '1001', todHidden: true, asdHidden: true });
  expect(state.incompleteRunway).toMatchObject({ available: false, reasons: ['Airport data incomplete'] });
  expect(state.shortRunway.available).toBe(false);
  expect(state.shortRunway.reasons.join(' ')).toMatch(/exceeds TORA|exceeds TODA|exceeds ASDA/);
});

test('an unsupported registration gives a recoverable error without switching engines', async ({ page }) => {
  await openApp(page, 'SE-LTL');
  await page.evaluate(() => BeechcraftApp.aircraft.handleRegistrationChange('XX-XXX'));
  await expect(page.locator('#global-registration')).toHaveValue('SE-LTL');
  await expect(page.locator('#registration-error')).toContainText('No performancedata is available for XX-XXX');
  await expect(page.locator('main')).toBeVisible();
});

for (const item of [
  { registration: 'SE-MHU', aboveLimit: '16600', belowLimit: '16000', limit: '16,100' },
  { registration: 'SE-RIJ', aboveLimit: '19000', belowLimit: '18000', limit: '18,700' },
]) {
  test(`${item.registration}: landing mass warning follows its design limit`, async ({ page }) => {
    await openApp(page, item.registration);
    const setSlider = async (value) => page.locator('#ldg-mass').evaluate((control, next) => {
      control.value = String(next);
      control.dispatchEvent(new Event('input', { bubbles: true }));
    }, value);
    const warning = page.locator('#ldg-overweight-warning');
    await setSlider(item.aboveLimit);
    await expect(warning).toBeVisible();
    await expect(warning).toContainText('Emergency use only');
    await expect(warning).toContainText(item.limit);
    await setSlider(item.belowLimit);
    await expect(warning).toBeHidden();
  });
}

for (const item of [
  { registration: 'SE-LTL', takeoffMass: '11000', landingMass: '10500', flaps: 'APP', landingFlaps: 'UP' },
  { registration: 'SE-MHU', takeoffMass: '14000', landingMass: '13500', flaps: 'TAKE', landingFlaps: 'DOWN', technique: 'Rolling take off' },
  { registration: 'SE-RIJ', takeoffMass: '16000', landingMass: '16000', flaps: '15', landingFlaps: '35', takeoffReversers: 'INOP', deice: 'YES', landingReversers: 'INOP' },
]) {
  test(`${item.registration}: supported setup and representative inputs persist across reload`, async ({ page }) => {
    await openApp(page, item.registration);
    const flaps = await page.locator('#to-flaps option').evaluateAll((options) => options.map((option) => option.value));
    expect(flaps).toContain(item.flaps);
    const setSlider = async (id, value) => page.locator(`#${id}`).evaluate((control, next) => {
      control.value = String(next);
      control.dispatchEvent(new Event('input', { bubbles: true }));
    }, value);

    await setSlider('to-mass', item.takeoffMass);
    await page.locator('#to-flaps').selectOption(item.flaps);
    await page.locator('#to-anti-ice').selectOption('OFF');
    await page.locator('#to-rwcc').selectOption('4');
    if (item.takeoffReversers) await page.locator('#to-reversers').selectOption(item.takeoffReversers);
    if (item.deice) await page.locator('#to-deice').selectOption(item.deice);
    if (item.technique) await page.locator('#to-technique').selectOption(item.technique);
    await page.locator('#to-wind-dir').fill('035');
    await page.locator('#to-wind-spd').fill('9');
    await page.locator('#to-oat').fill('12');
    await page.locator('#to-qnh').fill('1008');

    await page.locator('#landing-tab-button').click();
    await setSlider('ldg-mass', item.landingMass);
    await page.locator('#ldg-flaps').selectOption(item.landingFlaps);
    await page.locator('#ldg-anti-ice').selectOption('OFF');
    await page.locator('#ldg-rwcc').selectOption('4');
    if (item.landingReversers) await page.locator('#ldg-reversers').selectOption(item.landingReversers);
    await page.locator('#ldg-wind-dir').fill('210');
    await page.locator('#ldg-wind-spd').fill('7');
    await page.locator('#ldg-oat').fill('9');
    await page.locator('#ldg-qnh').fill('1009');
    await page.reload();
    await page.waitForFunction(() => Boolean(window.__testAppInitPromise));
    await page.evaluate(() => window.__testAppInitPromise);

    await expect(page.locator('#global-registration')).toHaveValue(item.registration);
    await expect(page.locator('#page-landing')).toBeVisible();
    for (const [id, value] of Object.entries({
      'to-mass': item.takeoffMass, 'to-flaps': item.flaps, 'to-anti-ice': 'OFF', 'to-rwcc': '4',
      'to-wind-dir': '35', 'to-wind-spd': '9', 'to-oat': '12', 'to-qnh': '1008',
      'ldg-mass': item.landingMass, 'ldg-flaps': item.landingFlaps, 'ldg-anti-ice': 'OFF', 'ldg-rwcc': '4',
      'ldg-wind-dir': '210', 'ldg-wind-spd': '7', 'ldg-oat': '9', 'ldg-qnh': '1009',
      ...(item.takeoffReversers ? { 'to-reversers': item.takeoffReversers } : {}),
      ...(item.deice ? { 'to-deice': item.deice } : {}),
      ...(item.technique ? { 'to-technique': item.technique } : {}),
      ...(item.landingReversers ? { 'ldg-reversers': item.landingReversers } : {}),
    })) await expect(page.locator(`#${id}`), `${item.registration}: ${id}`).toHaveValue(value);
  });
}
