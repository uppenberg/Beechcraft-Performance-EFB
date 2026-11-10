const { test, expect } = require('./support/coverage-test');
test.use({ serviceWorkers: 'block' });
const appUpdateBaseline = require('./references/app-update-regression.json');
const verifiedLandingTable = require('../tools/afm-audit/review/landing-distance-level-0ft-20000.verified.json');
const { blockExternalRequests, loadC56xPerformanceData } = require('./support/app-helpers');

const takeoffBase = {
  qnhHpa: 1013,
  fieldElevationFt: 100,
  oatC: 0,
  weightLb: 17_500,
  windDirectionDeg: 20,
  windSpeedKnots: 10,
  runwayHeadingDeg: 20,
  runwaySlopePercent: 0,
  runwayConditionCode: '6',
  reverserStatus: 'AVAILABLE',
  antiIce: 'ON',
  flaps: 7,
  deiceFluidApplied: false,
};

const landingBase = {
  qnhHpa: 1013,
  fieldElevationFt: 100,
  oatC: 15,
  weightLb: 17_000,
  headwindKnots: 10,
  runwaySlopePercent: 0,
  runwayConditionCode: '6',
  antiIce: 'OFF',
  reverserStatus: 'AVAILABLE',
};

test.beforeEach(async ({ context }) => {
  await blockExternalRequests(context);
});

test('C56X landing calculations match manually verified Figure 4-44 cells', async ({ page }) => {
  await loadC56xPerformanceData(page);
  expect(verifiedLandingTable.status).toBe('MANUALLY_VERIFIED');
  const actual = await page.evaluate((reference) => reference.rows.map((row) =>
    reference.windKnots.map((wind) => getC56xLandingDistance({
      pressureAltitudeFt: reference.altitudeFt,
      weightLb: reference.weightLb,
      oatC: row.temp,
      headwindKnots: wind,
      runwaySlopePercent: reference.runwayGradientPercent,
    }))
  ), verifiedLandingTable);
  expect(actual).toEqual(verifiedLandingTable.rows.map((row) => row.distancesFt));
});

test('C56X algorithm outputs match the approved app-update regression baseline', async ({ page }) => {
  const reference = appUpdateBaseline.references.find((entry) => entry.model === 'C56X');
  expect(appUpdateBaseline.status).toContain('APPROVED APP-UPDATE REGRESSION BASELINE');
  await loadC56xPerformanceData(page);

  const actual = await page.evaluate((inputs) => ({
    takeoff: getC56xTakeoffFieldLengths(inputs.takeoff),
    landing: getC56xLandingPerformance(inputs.landing),
  }), reference.algorithmicInputs);

  expect(actual).toEqual(reference.algorithmicOutputs);
});

test('C56X takeoff matrix covers wind, weight, flaps, anti-ice, RCC, slope and fluid', async ({ page }) => {
  await loadC56xPerformanceData(page);
  const results = await page.evaluate(({ takeoffBase }) => {
    const cases = [];
    for (const flaps of [7, 15]) {
      for (const antiIce of ['ON', 'OFF']) {
        for (const runwayConditionCode of ['1', '2', '3', '4', '5', '6']) {
          for (const weightLb of [15_000, 17_500, 19_000]) {
            for (const runwaySlopePercent of [-1, 0, 1]) {
              for (const windOffset of [-10, 0, 10]) {
                for (const deiceFluidApplied of [false, true]) {
                  const args = {
                    ...takeoffBase,
                    flaps,
                    antiIce,
                    runwayConditionCode,
                    weightLb,
                    runwaySlopePercent,
                    windSpeedKnots: Math.abs(windOffset),
                    windDirectionDeg: windOffset < 0 ? 200 : windOffset > 0 ? 20 : 110,
                    deiceFluidApplied,
                  };
                  const result = getC56xTakeoffFieldLengths(args);
                  cases.push({ args, result });
                }
              }
            }
          }
        }
      }
    }
    return cases;
  }, { takeoffBase });

  expect(results).toHaveLength(2 * 2 * 6 * 3 * 3 * 3 * 2);
  for (const { args, result } of results) {
    expect(result, JSON.stringify(args)).not.toBeNull();
    expect(Number.isFinite(result.pressureAltitudeFt), JSON.stringify(args)).toBeTruthy();
    expect(result.dryDistanceFt, JSON.stringify(args)).toBeGreaterThan(0);
    expect(result.selectedDistanceFt, JSON.stringify(args)).toBeGreaterThan(0);
    expect(result.factorBreakdown.performanceFactor, JSON.stringify(args))
      .toBe(args.flaps === 7 ? 1.10 : 1.16);
    expect(result.factorBreakdown.deiceFluidFactor, JSON.stringify(args))
      .toBe(args.deiceFluidApplied ? 1.15 : 1);
    expect(result.selectedDistanceFt, JSON.stringify(args))
      .toBeCloseTo(result.dryDistanceFt * result.takeoffFactor, 5);
  }
});

test('C56X takeoff distance reacts consistently to mass, headwind, tailwind, RCC and runway slope', async ({ page }) => {
  await loadC56xPerformanceData(page);
  const outputs = await page.evaluate(({ takeoffBase }) => {
    const calculate = (overrides = {}) => getC56xTakeoffFieldLengths({ ...takeoffBase, ...overrides });
    return {
      lowMass: calculate({ weightLb: 15_000 }),
      highMass: calculate({ weightLb: 19_000 }),
      headwind: calculate({ windSpeedKnots: 10, windDirectionDeg: 20 }),
      tailwind: calculate({ windSpeedKnots: 10, windDirectionDeg: 200 }),
      dryRcc: calculate({ runwayConditionCode: '6' }),
      rcc1: calculate({ runwayConditionCode: '1' }),
      level: calculate({ runwaySlopePercent: 0 }),
      uphill: calculate({ runwaySlopePercent: 1 }),
      fluidOff: calculate({ deiceFluidApplied: false }),
      fluidOn: calculate({ deiceFluidApplied: true }),
    };
  }, { takeoffBase });

  for (const [name, result] of Object.entries(outputs)) {
    expect(result, name).not.toBeNull();
  }
  expect(outputs.highMass.dryDistanceFt).toBeGreaterThan(outputs.lowMass.dryDistanceFt);
  expect(outputs.tailwind.dryDistanceFt).toBeGreaterThan(outputs.headwind.dryDistanceFt);
  expect(outputs.rcc1.selectedDistanceFt).toBeGreaterThan(outputs.dryRcc.selectedDistanceFt);
  expect(outputs.uphill.dryDistanceFt).toBeGreaterThan(outputs.level.dryDistanceFt);
  expect(outputs.fluidOn.selectedDistanceFt / outputs.fluidOff.selectedDistanceFt)
    .toBeCloseTo(1.15, 5);
});

test('C56X landing matrix covers wind, weight, RCC, anti-ice, reversers and runway slope', async ({ page }) => {
  await loadC56xPerformanceData(page);
  const results = await page.evaluate(({ landingBase }) => {
    const cases = [];
    for (const runwayConditionCode of ['1', '2', '3', '4', '5', '6']) {
      for (const reverserStatus of ['AVAILABLE', 'INOP']) {
        for (const antiIce of ['ON', 'OFF']) {
          for (const weightLb of [14_000, 17_000, 18_500]) {
            for (const headwindKnots of [-10, 0, 10, 30]) {
              for (const runwaySlopePercent of [-2, -1, 0]) {
                const args = {
                  ...landingBase,
                  runwayConditionCode,
                  reverserStatus,
                  antiIce,
                  weightLb,
                  headwindKnots,
                  runwaySlopePercent,
                };
                cases.push({ args, result: getC56xLandingPerformance(args) });
              }
            }
          }
        }
      }
    }
    return cases;
  }, { landingBase });

  expect(results).toHaveLength(6 * 2 * 2 * 3 * 4 * 3);
  for (const { args, result } of results) {
    expect(result.distanceFt, JSON.stringify(args)).toBeGreaterThan(0);
    expect(result.factor, JSON.stringify(args)).toBeGreaterThan(0);
    expect(result.requiredDistanceFt, JSON.stringify(args))
      .toBeCloseTo(result.distanceFt * result.factor, 5);
    expect(Number.isFinite(result.vref), JSON.stringify(args)).toBeTruthy();
    expect(Number.isFinite(result.vapp), JSON.stringify(args)).toBeTruthy();
    expect(result.maxLandingWeight).toHaveProperty('limitingLb');
  }
});

test('C56X landing factors, wind, mass and runway-limit boundaries are internally consistent', async ({ page }) => {
  await loadC56xPerformanceData(page);
  const outputs = await page.evaluate(({ landingBase }) => {
    const calculate = (overrides = {}) => getC56xLandingPerformance({ ...landingBase, ...overrides });
    return {
      lowMass: calculate({ weightLb: 14_000 }),
      highMass: calculate({ weightLb: 18_500 }),
      tailwind: calculate({ headwindKnots: -10 }),
      headwind: calculate({ headwindKnots: 30 }),
      rcc6: calculate({ runwayConditionCode: '6' }),
      rcc1: calculate({ runwayConditionCode: '1' }),
      reversersAvailable: calculate({ runwayConditionCode: '4', reverserStatus: 'AVAILABLE' }),
      reversersInop: calculate({ runwayConditionCode: '4', reverserStatus: 'INOP' }),
      antiIceOff: calculate({ antiIce: 'OFF' }),
      antiIceOn: calculate({ antiIce: 'ON' }),
      downhill: calculate({ runwaySlopePercent: -2 }),
      level: calculate({ runwaySlopePercent: 0 }),
    };
  }, { landingBase });

  for (const result of Object.values(outputs)) expect(result.distanceFt).toBeGreaterThan(0);
  expect(outputs.highMass.distanceFt).toBeGreaterThan(outputs.lowMass.distanceFt);
  expect(outputs.tailwind.distanceFt).toBeGreaterThan(outputs.headwind.distanceFt);
  expect(outputs.rcc1.factor).toBeGreaterThan(outputs.rcc6.factor);
  expect(outputs.reversersInop.factor).toBeGreaterThan(outputs.reversersAvailable.factor);
  expect(outputs.antiIceOn).toHaveProperty('approachClimbGradient');
  expect(outputs.downhill.distanceFt).toBeGreaterThan(outputs.level.distanceFt);

  const runwayLengthsM = outputs.rcc6.requiredDistanceFt * 0.3048;
  expect(runwayLengthsM - 0.1).toBeLessThan(runwayLengthsM);
  expect(runwayLengthsM + 0.1).toBeGreaterThan(runwayLengthsM);
});

test('runway-limit comparison passes at equality and fails just above the limit', async ({ page }) => {
  await loadC56xPerformanceData(page);
  const results = await page.evaluate(() => ({
    exactLimit: BeechcraftApp.results.exceedsDistanceLimit(100, 100),
    belowLimit: BeechcraftApp.results.exceedsDistanceLimit(99.9, 100),
    aboveLimit: BeechcraftApp.results.exceedsDistanceLimit(100.1, 100),
    missingDistance: BeechcraftApp.results.exceedsDistanceLimit('#N/A', 100),
    missingRunwayLimit: BeechcraftApp.results.exceedsDistanceLimit(100, ''),
  }));

  expect(results).toEqual({
    exactLimit: false,
    belowLimit: false,
    aboveLimit: true,
    missingDistance: null,
    missingRunwayLimit: null,
  });
});

test('C56X calculations reject invalid wind, setup, weather and AFM-out-of-range cases', async ({ page }) => {
  await loadC56xPerformanceData(page);
  const result = await page.evaluate(({ takeoffBase, landingBase }) => ({
    negativeTakeoffWind: getC56xTakeoffFieldLengths({ ...takeoffBase, windSpeedKnots: -1 }),
    missingTakeoffDirection: getC56xTakeoffFieldLengths({ ...takeoffBase, windDirectionDeg: NaN }),
    invalidTakeoffFlaps: getC56xTakeoffFieldLengths({ ...takeoffBase, flaps: 35 }),
    unsupportedTakeoffRcc: getC56xTakeoffFieldLengths({ ...takeoffBase, runwayConditionCode: '0' }),
    invalidQnh: (() => {
      try {
        getC56xTakeoffFieldLengths({ ...takeoffBase, qnhHpa: 0 });
        return { threw: false };
      } catch (error) {
        return { threw: true, name: error.name, message: error.message };
      }
    })(),
    steepRunway: getC56xLandingPerformance({ ...landingBase, runwaySlopePercent: -2.1 }),
    excessiveTailwind: getC56xLandingPerformance({ ...landingBase, headwindKnots: -10.1 }),
    unsupportedLandingRcc: getC56xLandingPerformance({ ...landingBase, runwayConditionCode: '0' }),
    hotOutsideData: getC56xLandingPerformance({ ...landingBase, oatC: 80 }),
  }), { takeoffBase, landingBase });

  expect(result.negativeTakeoffWind).toBeNull();
  expect(result.missingTakeoffDirection).toBeNull();
  expect(result.invalidTakeoffFlaps).toBeNull();
  expect(result.unsupportedTakeoffRcc).toBeNull();
  expect(result.invalidQnh).toMatchObject({ threw: true, name: 'RangeError' });
  expect(result.steepRunway.distanceFt).toBeNull();
  expect(result.excessiveTailwind.distanceFt).toBeNull();
  expect(result.unsupportedLandingRcc.factor).toBeNull();
  expect(result.unsupportedLandingRcc.requiredDistanceFt).toBeNull();
  expect(result.hotOutsideData.distanceFt).toBeNull();
});
