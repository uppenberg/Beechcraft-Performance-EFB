const { test, expect } = require('./support/coverage-test');
const { blockExternalRequests, chooseAirport, fillWeather, loadC56xPerformanceData, openApp, setServerMode } = require('./support/app-helpers');
const reference = require('./references/engine-regression.json');

test.use({ serviceWorkers: 'block' });
test.beforeEach(async ({ context, request }) => {
  await setServerMode(request, 'normal');
  await blockExternalRequests(context);
});

function checkOutputs(actual, expected) {
  expect(Object.keys(actual).sort()).toEqual(Object.keys(expected).sort());
  for (const [field, value] of Object.entries(expected)) {
    expect(actual[field], field).toBeCloseTo(value, 6);
  }
}

// Exercise every distinct workbook via the normal registration and input controls.
for (const [registration, massLb, flaps] of [
  ['SE-LTL', 11500, 'APP'], ['SE-KVL', 11500, 'APP'], ['SE-MJU', 11500, 'APP'],
  ['SE-MHU', 15000, 'TAKE'],
]) {
  test(`${registration} workbook matches pre-update engine results`, async ({ page }) => {
    await openApp(page, registration);
    for (const phase of ['to', 'ldg']) {
      if (phase === 'ldg') await page.locator('#landing-tab-button').click();
      await chooseAirport(page, phase, 'EFHK', '22R');
      await fillWeather(page, phase, { direction: '200', speed: '12', oat: '10', qnh: '1005' });
      await page.locator(`#${phase}-mass`).evaluate((slider, mass) => {
        slider.value = String(mass);
        slider.dispatchEvent(new Event('input', { bubbles: true }));
      }, massLb);
      await page.locator(`#${phase}-rwcc`).selectOption('5');
      await page.locator(`#${phase}-flaps`).selectOption(phase === 'to' ? flaps : 'DOWN');
      if (phase === 'to') {
        await page.locator('#to-anti-ice').selectOption('ON');
        if (registration === 'SE-MHU') await page.locator('#to-technique').selectOption('Rolling take off');
      }
    }
    const actual = await page.evaluate(() => {
      const { workbookEngine, state: { CELL_MAPPING: { landing } } } = BeechcraftApp;
      const takeoff = ['tor', 'tod', 'asd', 'v1', 'vr', 'v2', 'climbGrad']
        .map(key => [key, workbookEngine.getTakeoffOutput(key, false)]);
      const arrival = ['vrefUp', 'vrefDown', 'ldgDistUp', 'ldgDistDown', 'missedClimb']
        .map(key => [key, workbookEngine.getOutputVal(landing.sheetName, landing.outputs[key], false)]);
      return Object.fromEntries([...takeoff, ...arrival]);
    });
    checkOutputs(actual, reference[registration]);
  });
}

test('C56X matches pre-update engine results', async ({ page }) => {
  await loadC56xPerformanceData(page);
  const actual = await page.evaluate(() => {
    const inputs = {
      qnhHpa: 1005, fieldElevationFt: 200, oatC: 10, weightLb: 16500, runwaySlopePercent: 0,
      runwayConditionCode: '5', flaps: 7, antiIce: 'OFF', reverserStatus: 'AVAILABLE',
    };
    const takeoff = getC56xTakeoffFieldLengths({ ...inputs, runwayHeadingDeg: 220,
      windDirectionDeg: 200, windSpeedKnots: 12, deiceFluidApplied: false });
    const conditions = { ...inputs, pressureAltitudeFt: takeoff.pressureAltitudeFt, headwindKnots: takeoff.headwindKnots };
    const { v1, vr, v2 } = getC56xTakeoffSpeeds(conditions);
    const landing = getC56xLandingPerformance(conditions);
    return {
      selectedDistanceFt: takeoff.selectedDistanceFt, v1, vr, v2,
      climbGradient: getC56xSecondSegmentClimbGradient({ ...conditions, turningClimb: true }),
      landingDistanceFt: landing.requiredDistanceFt, vref: landing.vref, vapp: landing.vapp,
    };
  });
  checkOutputs(actual, reference.C56X);
});
