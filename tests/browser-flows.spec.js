const { test, expect } = require('@playwright/test');
test.use({ serviceWorkers: 'block' });
const regressionBaseline = require('./references/app-update-regression.json');
const regressionReferences = Object.fromEntries(
  regressionBaseline.references.map((reference) => [reference.model, reference])
);
const {
  blockExternalRequests,
  chooseAirport,
  fillWeather,
  openApp,
  setServerMode,
} = require('./support/app-helpers');

const aircraftCases = [
  { model: 'BE20', registration: 'SE-LTL', takeoffValue: 'res-to-v1', landingValue: 'res-ldg-distdown' },
  { model: 'B190', registration: 'SE-MHU', takeoffValue: 'res-to-v1', landingValue: 'res-ldg-distdown' },
  { model: 'C56X', registration: 'SE-RIJ', takeoffValue: 'c56x-tora-status', landingValue: 'res-ldg-afm-distance' },
];

async function setSlider(page, id, value) {
  await page.locator(`#${id}`).evaluate((element, nextValue) => {
    element.value = String(nextValue);
    element.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
}

async function readFiniteOutput(page, id) {
  const text = (await page.locator(`#${id}`).textContent()).trim();
  const value = Number(text.replaceAll(',', '').replace(/\s/g, ''));
  expect(Number.isFinite(value), `${id} should be numeric, got "${text}"`).toBeTruthy();
  return value;
}

test.beforeEach(async ({ context, request }) => {
  await setServerMode(request, 'normal');
  await blockExternalRequests(context);
});

test('UI actions are externalized and delegated without inline event handlers', async ({ page }) => {
  await openApp(page, 'SE-LTL');

  await expect(page.locator('[onclick], [onchange], [oninput], [onkeydown], [onfocus]'))
    .toHaveCount(0);
  await page.locator('#landing-tab-button').click();
  await expect(page.locator('#page-landing')).toBeVisible();
});

test('takeoff runway availability checks restore serialized workbook input cells', async ({ page }) => {
  await openApp(page, 'SE-LTL');
  await chooseAirport(page, 'to', 'ESSA', '01L');

  const result = await page.evaluate(() => {
    const candidate = BeechcraftApp.airports.getAirportRows('ESSA')
      .find((airport) => airport.RWY !== '01L');
    if (!candidate) throw new Error('Expected a second ESSA runway for the restoration check.');

    const config = BeechcraftApp.state.CELL_MAPPING.takeoff;
    const sheet = BeechcraftApp.state.AppState.hfInstance.getSheetId(config.sheetName);
    const cellRefs = [
      config.inputs.airportAndRwy,
      ...Object.values(BeechcraftApp.state.AIRPORT_LOOKUP_CELLS_BY_PAGE.to),
    ];
    const addresses = cellRefs.map((cellRef) => {
      const position = BeechcraftApp.workbookEngine.parseCellRef(cellRef);
      return { sheet, col: position.col, row: position.row };
    });
    const before = addresses.map((address) =>
      BeechcraftApp.state.AppState.hfInstance.getCellSerialized(address) ?? null
    );
    const availability = BeechcraftApp.airports.evaluateTakeoffRunwayAvailability(candidate);
    const after = addresses.map((address) =>
      BeechcraftApp.state.AppState.hfInstance.getCellSerialized(address) ?? null
    );

    return { availability, before, after };
  });

  expect(result.availability).toHaveProperty('available');
  expect(result.after).toEqual(result.before);
});

for (const aircraft of aircraftCases) {
  test(`${aircraft.model}: startup, takeoff/landing calculation and runway limits`, async ({ page }) => {
    const reference = regressionReferences[aircraft.model];
    const inputs = reference.inputs;
    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    await openApp(page, aircraft.registration);
    await expect(page.locator('#airport-selection-error')).not.toContainText('Could not initialize');

    await chooseAirport(page, 'to', inputs.airport, inputs.runway);
    await fillWeather(page, 'to', {
      direction: String(inputs.windDirectionDeg).padStart(3, '0'),
      speed: String(inputs.windSpeedKnots),
      oat: String(inputs.takeoffOatC),
      qnh: String(inputs.qnhHpa),
    });

    await page.locator('#to-mass').evaluate((element, value) => {
      element.value = value;
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }, String(inputs.takeoffMassLb));
    await page.locator('#ldg-mass').evaluate((element, value) => {
      element.value = value;
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }, String(inputs.landingMassLb));

    await page.locator('#to-flaps').selectOption(inputs.takeoffFlaps);
    if (aircraft.model === 'C56X') {
      await page.locator('#to-anti-ice').selectOption(inputs.takeoffAntiIce);
      await page.locator('#to-rwcc').selectOption(inputs.takeoffRwcc);
      await page.locator('#to-reversers').selectOption(inputs.takeoffReversers);
      await page.locator('#to-deice').selectOption(inputs.takeoffDeiceFluid);
    } else {
      if (aircraft.model === 'B190') {
        await page.locator('#to-technique').selectOption(inputs.takeoffTechnique);
      }
      await expect(page.locator('#to-anti-ice')).toHaveValue(inputs.takeoffAntiIce);
      await expect(page.locator('#to-rwcc')).toHaveValue(inputs.takeoffRwcc);
      await expect(page.locator('#takeoff-exceedance-status')).toHaveText('Within limits');
      await expect(page.locator('#res-to-v1')).not.toHaveText('-');
      await expect(page.locator('#res-to-vr')).not.toHaveText('-');
      await expect(page.locator('#res-to-v2')).not.toHaveText('-');
      await expect(page.locator('#check-tor-val')).toHaveText(/^\d+(?:\.\d+)?$/);
      await expect(page.locator('#check-tod-val')).toHaveText(/^\d+(?:\.\d+)?$/);
      await expect(page.locator('#check-asd-val')).toHaveText(/^\d+(?:\.\d+)?$/);
    }

    await page.evaluate(() => BeechcraftApp.airports.switchTab('landing'));
    await chooseAirport(page, 'ldg', inputs.airport, inputs.runway);
    await fillWeather(page, 'ldg', {
      direction: String(inputs.windDirectionDeg).padStart(3, '0'),
      speed: String(inputs.windSpeedKnots),
      oat: String(inputs.landingOatC),
      qnh: String(inputs.qnhHpa),
    });
    if (aircraft.model === 'C56X') {
      await page.locator('#ldg-anti-ice').selectOption(inputs.landingAntiIce);
      await page.locator('#ldg-rwcc').selectOption(inputs.landingRwcc);
      await page.locator('#ldg-reversers').selectOption(inputs.landingReversers);
      await expect(page.locator('#res-ldg-afm-distance')).toContainText('ft');
      await expect(page.locator('#res-ldg-required-distance')).toContainText('ft');
    } else {
      await page.locator('#ldg-flaps').selectOption(inputs.landingFlaps);
      await expect(page.locator('#ldg-rwcc')).toHaveValue(inputs.landingRwcc);
      await expect(page.locator('#landing-exceedance-status')).toContainText('Within limits');
      await expect(page.locator('#res-ldg-vrefdown')).not.toHaveText('-');
      await expect(page.locator('#res-ldg-distdown')).not.toHaveText('-');
    }
    await page.evaluate(() => BeechcraftApp.airports.switchTab('takeoff'));
    if (aircraft.model === 'C56X') {
      await expect(page.locator('#c56x-tora-status')).not.toHaveText('-');
      await expect(page.locator('#c56x-toda-status')).not.toHaveText('-');
      await expect(page.locator('#c56x-asda-status')).not.toHaveText('-');
    }
    await page.evaluate(() => BeechcraftApp.airports.switchTab('landing'));
    await expect(page.locator('#page-landing')).toBeVisible();
    await expect(page.locator(`#${aircraft.landingValue}`)).not.toHaveText('-');
    const actualOutputs = await page.evaluate((ids) => Object.fromEntries(ids.map((id) => [
      id,
      document.getElementById(id)?.textContent?.trim() ?? null,
    ])), Object.keys(reference.outputs));
    expect(actualOutputs).toEqual(reference.outputs);
    expect(pageErrors).toEqual([]);
  });
}

for (const aircraft of [
  { model: 'BE20', registration: 'SE-LTL', minMass: 9200, maxMass: 12500, flaps: ['UP', 'APP'] },
  { model: 'B190', registration: 'SE-MHU', minMass: 10000, maxMass: 16600, flaps: ['UP', 'TAKE', 'APP'] },
]) {
  test(`${aircraft.model}: workbook calculations cover mass, wind, flaps, anti-ice and all RCC values`, async ({ page }) => {
    await openApp(page, aircraft.registration);
    await chooseAirport(page, 'to', 'ESSA', '01L');
    await fillWeather(page, 'to', { direction: '020', speed: '8', oat: '15', qnh: '1013' });
    if (aircraft.model === 'B190') await page.locator('#to-technique').selectOption({ index: 0 });
    await page.locator('#to-flaps').selectOption(aircraft.flaps[0]);
    await page.locator('#to-anti-ice').selectOption('OFF');
    await page.locator('#to-rwcc').selectOption('6');

    await setSlider(page, 'to-mass', aircraft.minMass);
    const lowMassDistance = await readFiniteOutput(page, 'check-tor-val');
    await setSlider(page, 'to-mass', aircraft.maxMass);
    const highMassDistance = await readFiniteOutput(page, 'check-tor-val');
    expect(highMassDistance).toBeGreaterThan(lowMassDistance);

    await page.locator('#to-wind-dir').fill('020');
    await page.locator('#to-wind-spd').fill('8');
    const headwindDistance = await readFiniteOutput(page, 'check-tor-val');
    await page.locator('#to-wind-dir').fill('200');
    const tailwindDistance = await readFiniteOutput(page, 'check-tor-val');
    expect(tailwindDistance).toBeGreaterThan(headwindDistance);

    for (let index = 0; index < 6; index += 1) {
      await page.locator('#to-rwcc').selectOption(String(6 - index));
      await page.locator('#to-flaps').selectOption(aircraft.flaps[index % aircraft.flaps.length]);
      await page.locator('#to-anti-ice').selectOption(index % 2 ? 'ON' : 'OFF');
      await setSlider(page, 'to-mass', index % 2 ? aircraft.minMass : aircraft.maxMass);
      await page.locator('#to-wind-dir').fill(index % 2 ? '020' : '200');
      await page.locator('#to-wind-spd').fill(String(5 + index));
      for (const id of ['check-tor-val', 'check-tod-val', 'check-asd-val', 'res-to-v1', 'res-to-vr', 'res-to-v2']) {
        await readFiniteOutput(page, id);
      }
    }

    await page.evaluate(() => BeechcraftApp.airports.switchTab('landing'));
    await chooseAirport(page, 'ldg', 'ESSA', '01L');
    await fillWeather(page, 'ldg', { direction: '020', speed: '8', oat: '15', qnh: '1013' });
    await page.locator('#ldg-flaps').selectOption('DOWN');
    await page.locator('#ldg-rwcc').selectOption('6');
    await setSlider(page, 'ldg-mass', aircraft.minMass);
    const lightLandingDistance = await readFiniteOutput(page, 'res-ldg-distdown');
    await setSlider(page, 'ldg-mass', aircraft.maxMass);
    const heavyLandingDistance = await readFiniteOutput(page, 'res-ldg-distdown');
    expect(heavyLandingDistance).toBeGreaterThan(lightLandingDistance);

    await page.locator('#ldg-wind-dir').fill('020');
    await page.locator('#ldg-wind-spd').fill('8');
    const landingHeadwindDistance = await readFiniteOutput(page, 'res-ldg-distdown');
    await page.locator('#ldg-wind-dir').fill('200');
    const landingTailwindDistance = await readFiniteOutput(page, 'res-ldg-distdown');
    expect(landingTailwindDistance).toBeGreaterThan(landingHeadwindDistance);

    for (let index = 0; index < 6; index += 1) {
      await page.locator('#ldg-rwcc').selectOption(String(6 - index));
      await page.locator('#ldg-flaps').selectOption(index % 2 ? 'UP' : 'DOWN');
      for (const id of ['res-ldg-distup', 'res-ldg-distdown', 'res-ldg-vrefup', 'res-ldg-vrefdown']) {
        await readFiniteOutput(page, id);
      }
    }
  });
}

for (const aircraft of [
  { model: 'BE20', registration: 'SE-LTL', mass: '12000', takeoffFlaps: 'APP' },
  { model: 'B190', registration: 'SE-MHU', mass: '15000', takeoffFlaps: 'TAKE' },
]) {
  test(`${aircraft.model}: short custom runway flags takeoff and landing exceedances`, async ({ page }) => {
    await openApp(page, aircraft.registration);
    await page.locator('#settings-toggle').click();
    await page.locator('#custom-airport-checkbox').check();
    await page.locator('#edit-custom-airports-button').click();

    const values = {
      'ca-icao': 'ZZZA', 'ca-rwy': '09', 'ca-elev': '500',
      'ca-tora': '200', 'ca-toda': '200', 'ca-asda': '200', 'ca-lda': '200',
      'ca-slope': '0', 'ca-hdg': '90', 'ca-grad': '3.3',
    };
    for (const [id, value] of Object.entries(values)) await page.locator(`#${id}`).fill(value);
    await page.locator('#custom-airport-form button[type="submit"]').click();
    await page.locator('#custom-airport-close').click();

    await chooseAirport(page, 'to', 'ZZZA', '09');
    await fillWeather(page, 'to', { direction: '090', speed: '5', oat: '15', qnh: '1013' });
    await page.locator('#to-mass').evaluate((element, value) => {
      element.value = value;
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }, aircraft.mass);
    await page.locator('#to-flaps').selectOption(aircraft.takeoffFlaps);
    if (aircraft.model === 'B190') await page.locator('#to-technique').selectOption({ index: 0 });
    await expect(page.locator('#takeoff-exceedance-status')).toContainText('Exceeded');

    await page.evaluate(() => BeechcraftApp.airports.switchTab('landing'));
    await chooseAirport(page, 'ldg', 'ZZZA', '09');
    await fillWeather(page, 'ldg', { direction: '090', speed: '5', oat: '15', qnh: '1013' });
    await page.locator('#ldg-mass').evaluate((element, value) => {
      element.value = value;
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }, aircraft.mass);
    await page.locator('#ldg-flaps').selectOption('DOWN');
    await expect(page.locator('#landing-exceedance-status')).toContainText('Exceeded');
  });
}

test('BE20 takeoff and landing inputs and selected airport persist through reload', async ({ page }) => {
  await openApp(page, 'SE-LTL');
  await chooseAirport(page, 'to', 'ESSA', '01L');
  await fillWeather(page, 'to', { direction: '020', speed: '8', oat: '17', qnh: '1008' });
  await setSlider(page, 'to-mass', 11000);
  await page.locator('#to-flaps').selectOption('APP');
  await page.locator('#to-rwcc').selectOption('5');

  await page.evaluate(() => BeechcraftApp.airports.switchTab('landing'));
  await chooseAirport(page, 'ldg', 'ESSA', '01L');
  await fillWeather(page, 'ldg', { direction: '030', speed: '6', oat: '12', qnh: '1009' });
  await setSlider(page, 'ldg-mass', 10500);
  await page.locator('#ldg-flaps').selectOption('UP');
  await page.locator('#ldg-rwcc').selectOption('4');

  await page.reload();
  await page.waitForFunction(() => Boolean(window.__testAppInitPromise));
  await page.evaluate(() => window.__testAppInitPromise);
  await expect(page.locator('#page-landing')).toBeVisible();
  await expect(page.locator('#to-airport-icao')).toHaveValue('ESSA');
  await expect(page.locator('#to-airport-rwy')).toHaveValue('01L');
  await expect(page.locator('#to-wind-dir')).toHaveValue('20');
  await expect(page.locator('#to-wind-spd')).toHaveValue('8');
  await expect(page.locator('#to-oat')).toHaveValue('17');
  await expect(page.locator('#to-qnh')).toHaveValue('1008');
  await expect(page.locator('#to-mass')).toHaveValue('11000');
  await expect(page.locator('#to-flaps')).toHaveValue('APP');
  await expect(page.locator('#to-rwcc')).toHaveValue('5');
  await expect(page.locator('#ldg-airport-icao')).toHaveValue('ESSA');
  await expect(page.locator('#ldg-airport-rwy')).toHaveValue('01L');
  await expect.poll(async () => Number(await page.locator('#ldg-wind-dir').inputValue())).toBe(30);
  await expect(page.locator('#ldg-wind-spd')).toHaveValue('6');
  await expect(page.locator('#ldg-oat')).toHaveValue('12');
  await expect(page.locator('#ldg-qnh')).toHaveValue('1009');
  await expect(page.locator('#ldg-mass')).toHaveValue('10500');
  await expect(page.locator('#ldg-flaps')).toHaveValue('UP');
  await expect(page.locator('#ldg-rwcc')).toHaveValue('4');
});

test('BE20 to B190 and C56X model changes require confirmation and load the selected model', async ({ page }) => {
  await openApp(page, 'SE-LTL');
  const registration = page.locator('#global-registration');

  await registration.selectOption('SE-KVL');
  await expect(page.locator('#aircraft-change-dialog')).not.toBeVisible();
  await expect(registration).toHaveValue('SE-KVL');

  await registration.selectOption('SE-MHU');
  await expect(page.locator('#aircraft-change-dialog')).toBeVisible();
  await page.locator('.aircraft-change-confirm').click();
  await expect(registration).toHaveValue('SE-MHU');
  await expect(page.locator('#to-mass')).toHaveAttribute('max', '16600');
  await expect(page.locator('#to-technique-row')).toBeVisible();

  await registration.selectOption('SE-RIJ');
  await expect(page.locator('#aircraft-change-dialog')).toBeVisible();
  await page.locator('.aircraft-change-cancel').click();
  await expect(registration).toHaveValue('SE-MHU');

  await registration.selectOption('SE-RIJ');
  await page.locator('.aircraft-change-confirm').click();
  await expect(registration).toHaveValue('SE-RIJ');
  await expect(page.locator('#to-mass')).toHaveAttribute('max', '20000');
  await expect(page.locator('#to-flaps option')).toHaveText(['Flaps 7°', 'Flaps 15°']);
  await expect(page.locator('#c56x-takeoff-performance')).toBeVisible();
});

test('custom airports can be created, selected, reused after reload, edited and deleted', async ({ page }) => {
  await openApp(page, 'SE-RIJ');
  const settings = page.locator('#settings-toggle');
  await settings.click();
  await page.locator('#custom-airport-checkbox').check();
  await expect(page.locator('#edit-custom-airports-button')).toBeVisible();
  await page.locator('#edit-custom-airports-button').click();
  await page.locator('#custom-airport-form button[type="submit"]').click();
  await expect(page.locator('#custom-airport-list')).toContainText('No custom runways saved yet');

  const values = {
    'ca-icao': 'ZZZZ', 'ca-rwy': '09', 'ca-elev': '500',
    'ca-tora': '200', 'ca-toda': '200', 'ca-asda': '200', 'ca-lda': '200',
    'ca-slope': '0', 'ca-hdg': '90', 'ca-grad': '3.3',
  };
  for (const [id, value] of Object.entries(values)) await page.locator(`#${id}`).fill(value);
  await page.locator('#custom-airport-form button[type="submit"]').click();
  await expect(page.locator('#custom-airport-list')).toContainText('ZZZZ RWY 09');
  await page.locator('#custom-airport-close').click();

  await chooseAirport(page, 'to', 'ZZZZ', '09');
  await fillWeather(page, 'to', { direction: '090', speed: '5', oat: '0', qnh: '1013' });
  await page.locator('#to-mass').evaluate((element) => {
    element.value = '17500';
    element.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await page.evaluate(() => BeechcraftApp.airports.switchTab('landing'));
  await chooseAirport(page, 'ldg', 'ZZZZ', '09');
  await fillWeather(page, 'ldg', { direction: '090', speed: '5', oat: '15', qnh: '1013' });
  await expect(page.locator('#c56x-tora-status')).toContainText('/ 200 m');
  await expect(page.locator('#c56x-badge-tora')).toHaveText('FAIL');
  await expect(page.locator('#c56x-badge-toda')).toHaveText('FAIL');
  await expect(page.locator('#c56x-badge-asda')).toHaveText('FAIL');
  await expect(page.locator('#landing-exceedance-status')).toContainText('Exceeds LDA');

  await page.reload();
  await page.waitForFunction(() => Boolean(window.__testAppInitPromise));
  await page.evaluate(() => window.__testAppInitPromise);
  await expect(page.locator('#global-registration')).toHaveValue('SE-RIJ');
  await page.locator('#settings-toggle').click();
  await expect(page.locator('#custom-airport-checkbox')).toBeChecked();
  await page.locator('#edit-custom-airports-button').click();
  await expect(page.locator('#custom-airport-list')).toContainText('ZZZZ RWY 09');
  await page.getByRole('button', { name: 'Edit' }).click();
  await page.locator('#ca-tora').fill('600');
  await page.locator('#custom-airport-form button[type="submit"]').click();
  await expect(page.locator('#custom-airport-list')).toContainText('ZZZZ RWY 09');
  await expect.poll(async () => page.evaluate(() =>
    JSON.parse(localStorage.getItem('custom_airports') || '[]')[0]?.['TORA [m] (C6)']
  )).toBe('600');
  await page.getByRole('button', { name: 'Delete' }).click();
  await expect(page.locator('#custom-airport-list')).toContainText('No custom runways saved yet');
});

test('missing and invalid fields stay recoverable without unhandled browser errors', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await openApp(page, 'SE-RIJ');

  await expect(page.locator('#c56x-tora-status')).toContainText('Not available');
  await chooseAirport(page, 'to', 'ESSA', '01L');
  await page.locator('#to-oat').fill('0');
  await page.locator('#to-qnh').fill('1013');
  await page.locator('#to-wind-dir').fill('020');
  await page.locator('#to-wind-spd').fill('-5');
  await expect(page.locator('#c56x-tora-status')).toContainText('Not available');
  await page.locator('#to-wind-spd').fill('5');
  await expect(page.locator('#c56x-tora-status')).not.toHaveText('Not available');
  await page.locator('#to-qnh').fill('');
  await expect(page.locator('#c56x-tora-status')).toContainText('Not available');

  await page.evaluate(() => BeechcraftApp.airports.switchTab('landing'));
  await page.locator('#ldg-oat').fill('80');
  await page.locator('#ldg-qnh').fill('1013');
  await page.locator('#ldg-wind-dir').fill('020');
  await page.locator('#ldg-wind-spd').fill('10');
  await chooseAirport(page, 'ldg', 'ESSA', '01L');
  await expect(page.locator('#landing-exceedance-status')).toContainText('outside the AFM landing data');
  expect(pageErrors).toEqual([]);
});
