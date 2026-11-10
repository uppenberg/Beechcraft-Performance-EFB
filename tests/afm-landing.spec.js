const { test, expect } = require('@playwright/test');
const reference = require('./references/c56x-afm-figure-4-44.json');
const { attachAfmReport } = require('./support/afm-report');
const { applyIpadMiniScreenshotAppearance } = require('./support/ipad-mini-appearance');
const { blockExternalRequests, chooseAirport, fillWeather, loadC56xPerformanceData, openApp } = require('./support/app-helpers');

test.use({ serviceWorkers: 'block' });
test.beforeEach(async ({ context }) => blockExternalRequests(context));

function compare(sample, actual, extra = {}) {
  return {
    reference: sample,
    actual,
    deltaFt: Number.isFinite(actual.distanceFt) ? actual.distanceFt - sample.distanceFt : null,
    passed: actual.distanceFt === sample.distanceFt && actual.vref === sample.vref && actual.vapp === sample.vapp,
    ...extra,
  };
}

function assertAfmValues(sample, actual) {
  expect.soft(actual.distanceFt, `${sample.id}: AFM actual distance, ft`).toBe(sample.distanceFt);
  expect.soft(actual.vref, `${sample.id}: AFM VREF, KIAS`).toBe(sample.vref);
  expect.soft(actual.vapp, `${sample.id}: AFM VAPP, KIAS`).toBe(sample.vapp);
}

test('AFM Figure 4-44: 12 exact table points with a comparison report', async ({ page }, testInfo) => {
  const observations = [];
  try {
    await loadC56xPerformanceData(page);
    // One page load and one browser round trip for all points. References come
    // from the supplied PDF, never from the production data or a golden run.
    const actual = await page.evaluate((samples) => samples.map((sample) => {
      const inputs = {
        pressureAltitudeFt: sample.pressureAltitudeFt,
        weightLb: sample.weightLb,
        oatC: sample.oatC,
        headwindKnots: sample.headwindKnots,
        runwaySlopePercent: 0,
      };
      return { inputs, distanceFt: getC56xLandingDistance(inputs), ...getC56xLandingSpeeds(inputs) };
    }), reference.cases);
    for (const [index, sample] of reference.cases.entries()) {
      await test.step(`${sample.id}: PA ${sample.pressureAltitudeFt} ft, ${sample.weightLb} lb, ${sample.oatC} C, wind ${sample.headwindKnots} kt -> ${sample.distanceFt} ft`, async () => {
        observations.push(compare(sample, actual[index]));
        assertAfmValues(sample, actual[index]);
      });
    }
  } finally {
    await attachAfmReport(testInfo, reference, observations, reference.cases.length);
  }
});

test('AFM Figure 4-44: visible landing inputs and outputs with screenshots', async ({ page }, testInfo) => {
  const samples = reference.cases.filter((sample) => ['AFM-01', 'AFM-11'].includes(sample.id));
  const observations = [];
  try {
    await openApp(page, 'SE-RIJ');
    if (testInfo.project.name === 'ipad-mini') await applyIpadMiniScreenshotAppearance(page);
    // Observe the real UI's call without changing its arguments or return value.
    await page.evaluate(() => {
      const calculate = window.getC56xLandingPerformance;
      window.getC56xLandingPerformance = function (inputs) {
        const result = calculate(inputs);
        window.__afmLandingCall = { inputs: { ...inputs }, result };
        return result;
      };
    });
    await page.locator('#settings-toggle').click();
    await page.locator('#custom-airport-checkbox').check();
    await page.locator('#edit-custom-airports-button').click();
    for (const sample of samples) {
      const values = {
        'ca-icao': sample.pressureAltitudeFt === 0 ? 'ZAFM' : 'ZAFN',
        'ca-rwy': '09', 'ca-elev': String(sample.pressureAltitudeFt),
        'ca-tora': '4000', 'ca-toda': '4000', 'ca-asda': '4000', 'ca-lda': '4000',
        'ca-slope': '0', 'ca-hdg': '90', 'ca-grad': '3.3',
      };
      for (const [id, value] of Object.entries(values)) await page.locator(`#${id}`).fill(value);
      await page.locator('#custom-airport-form button[type="submit"]').click();
      await expect(page.locator('#custom-airport-list')).toContainText(`${values['ca-icao']} RWY 09`);
    }
    await page.locator('#custom-airport-close').click();
    await page.locator('#landing-tab-button').click();

    for (const sample of samples) {
      await test.step(`${sample.id}: enter values, read them back, compare AFM ${sample.distanceFt} ft`, async () => {
        const requested = {
          'ldg-airport-icao': sample.pressureAltitudeFt === 0 ? 'ZAFM' : 'ZAFN',
          'ldg-airport-rwy': '09', 'ldg-wind-dir': '90',
          'ldg-wind-spd': String(sample.headwindKnots), 'ldg-oat': String(sample.oatC),
          // Standard QNH preserves the exact pressure-altitude table node.
          'ldg-qnh': '1013.25', 'ldg-mass': String(sample.weightLb),
          'ldg-rwcc': '6', 'ldg-anti-ice': 'OFF', 'ldg-reversers': 'AVAILABLE',
        };
        await chooseAirport(page, 'ldg', requested['ldg-airport-icao'], '09');
        await fillWeather(page, 'ldg', { direction: '90', speed: String(sample.headwindKnots), oat: String(sample.oatC), qnh: '1013.25' });
        await page.locator('#ldg-mass').evaluate((slider, weightLb) => {
          slider.value = String(weightLb);
          slider.dispatchEvent(new Event('input', { bubbles: true }));
        }, sample.weightLb);
        await page.locator('#ldg-rwcc').selectOption('6');
        await expect(page.locator('#ldg-anti-ice')).toHaveValue('OFF');
        await expect(page.locator('#ldg-reversers')).toHaveValue('AVAILABLE');
        await expect(page.locator('#res-ldg-afm-distance')).toContainText('ft');

        const visibleInputs = {};
        for (const id of Object.keys(requested)) visibleInputs[id] = await page.locator(`#${id}`).inputValue();
        const observed = await page.evaluate(() => ({
          appVersion: window.APP_VERSION,
          call: window.__afmLandingCall,
          displayed: {
            distance: document.getElementById('res-ldg-afm-distance').textContent.trim(),
            speeds: document.getElementById('res-ldg-vref-vapp').textContent.trim(),
          },
        }));
        const expectedEngineInputs = {
          qnhHpa: 1013.25, fieldElevationFt: sample.pressureAltitudeFt,
          oatC: sample.oatC, weightLb: sample.weightLb, headwindKnots: sample.headwindKnots,
          runwaySlopePercent: 0, runwayConditionCode: '6', antiIce: 'OFF', reverserStatus: 'AVAILABLE',
        };
        const expectedDisplayed = {
          distance: `${sample.distanceFt.toLocaleString('en-US')} ft (${Math.ceil(sample.distanceFt * 0.3048).toLocaleString('en-US')} m)`,
          speeds: `${sample.vref} / ${sample.vapp} KIAS`,
        };
        const row = compare(sample, observed.call.result, {
          appVersion: observed.appVersion, requested, visibleInputs,
          expectedEngineInputs, engineInputs: observed.call.inputs,
          expectedDisplayed, displayed: observed.displayed,
        });
        row.passed = row.passed && Object.entries(requested).every(([key, value]) => visibleInputs[key] === value) &&
          Object.entries(expectedEngineInputs).every(([key, value]) => observed.call.inputs[key] === value) &&
          Object.entries(expectedDisplayed).every(([key, value]) => observed.displayed[key] === value) &&
          observed.call.result.pressureAltitudeFt === sample.pressureAltitudeFt;
        observations.push(row);
        expect.soft(visibleInputs, `${sample.id}: values read back from the form`).toEqual(requested);
        expect.soft(observed.call.inputs, `${sample.id}: inputs used by the UI calculation`).toEqual(expectedEngineInputs);
        expect.soft(observed.call.result.pressureAltitudeFt, `${sample.id}: exact pressure-altitude node`).toBe(sample.pressureAltitudeFt);
        expect.soft(observed.displayed, `${sample.id}: results displayed in the app`).toEqual(expectedDisplayed);
        assertAfmValues(sample, observed.call.result);
        await testInfo.attach(`${sample.id} landing form and results`, {
          body: await page.screenshot({ fullPage: true }), contentType: 'image/png',
        });
      });
    }
  } finally {
    await attachAfmReport(testInfo, reference, observations, samples.length);
  }
});
