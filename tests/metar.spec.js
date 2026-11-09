const { test, expect } = require('@playwright/test');
test.use({ serviceWorkers: 'block' });

const {
  blockExternalRequests,
  chooseAirport,
  fillWeather,
  openApp,
  setServerMode,
} = require('./support/app-helpers');

function makeCurrentMetar(wind) {
  const now = new Date();
  const observationTime = [
    String(now.getUTCDate()).padStart(2, '0'),
    String(now.getUTCHours()).padStart(2, '0'),
    String(now.getUTCMinutes()).padStart(2, '0'),
  ].join('');
  return `METAR ESSA ${observationTime}Z ${wind} 15/10 Q1013`;
}

async function stubMetar(page, wind) {
  const report = makeCurrentMetar(wind);
  await page.route('**/api/reports/metar**', (route) => route.fulfill({
    status: 200,
    contentType: 'text/plain',
    body: report,
  }));
}

test.beforeEach(async ({ context, request }) => {
  await setServerMode(request, 'normal');
  await blockExternalRequests(context);
});

test('MPS METAR leaves takeoff and landing weather fields unchanged', async ({ page }) => {
  await openApp(page, 'SE-LTL');
  await fillWeather(page, 'to', { direction: '090', speed: '7', oat: '3', qnh: '1009' });
  await page.locator('#landing-tab-button').click();
  await fillWeather(page, 'ldg', { direction: '180', speed: '6', oat: '4', qnh: '1008' });
  await stubMetar(page, '02010MPS');

  await page.locator('.tab-btn').first().click();
  await chooseAirport(page, 'to', 'ESSA', '01L');
  await page.locator('#landing-tab-button').click();
  await chooseAirport(page, 'ldg', 'ESSA', '01L');

  await expect(page.locator('#to-wind-dir')).toHaveValue('90');
  await expect(page.locator('#to-wind-spd')).toHaveValue('7');
  await expect(page.locator('#to-oat')).toHaveValue('3');
  await expect(page.locator('#to-qnh')).toHaveValue('1009');
  await expect(page.locator('#ldg-wind-dir')).toHaveValue('180');
  await expect(page.locator('#ldg-wind-spd')).toHaveValue('6');
  await expect(page.locator('#ldg-oat')).toHaveValue('4');
  await expect(page.locator('#ldg-qnh')).toHaveValue('1008');
  await expect(page.locator('#to-metar-weather-status')).toContainText('left unchanged');
  await expect(page.locator('#ldg-metar-weather-status')).toContainText('left unchanged');
  await expect(page.locator('#to-runway-suggestion-text'))
    .toContainText(/METAR suggests RWY|Runways have similar headwind components/);
  await expect(page.locator('#ldg-runway-suggestion-text'))
    .toContainText(/METAR suggests RWY|Runways have similar headwind components/);
});

test('KT METAR continues to fill available takeoff and landing weather fields', async ({ page }) => {
  await openApp(page, 'SE-LTL');
  await fillWeather(page, 'to', { direction: '090', speed: '7', oat: '3', qnh: '1009' });
  await page.locator('#landing-tab-button').click();
  await fillWeather(page, 'ldg', { direction: '180', speed: '6', oat: '4', qnh: '1008' });
  await stubMetar(page, '02008KT');

  await page.locator('.tab-btn').first().click();
  await chooseAirport(page, 'to', 'ESSA', '01L');
  await page.locator('#landing-tab-button').click();
  await chooseAirport(page, 'ldg', 'ESSA', '01L');

  for (const prefix of ['to', 'ldg']) {
    await expect(page.locator(`#${prefix}-wind-dir`)).toHaveValue('20');
    await expect(page.locator(`#${prefix}-wind-spd`)).toHaveValue('8');
    await expect(page.locator(`#${prefix}-oat`)).toHaveValue('15');
    await expect(page.locator(`#${prefix}-qnh`)).toHaveValue('1013');
    await expect(page.locator(`#${prefix}-metar-weather-status`)).toBeHidden();
  }
});

test('shared METAR parser normalizes wind once and keeps MPS out of calculator values', async ({ page }) => {
  await openApp(page, 'SE-LTL');
  const parsed = await page.evaluate(() => ({
    mps: BeechcraftApp.metar.MetarWeather.parse('METAR ESSA 011230Z 02010G15MPS 15/10 Q1013'),
    knots: BeechcraftApp.metar.MetarWeather.parse('METAR ESSA 011230Z 34008G14KT M01/M03 A2992'),
    variable: BeechcraftApp.metar.MetarWeather.parse('METAR ESSA 011230Z VRB03KT 15/10 Q1013'),
    invalid: BeechcraftApp.metar.MetarWeather.parse(null),
  }));

  expect(parsed.mps).toEqual({
    windUnit: 'MPS',
    wind: {
      directionDegrees: 20,
      speed: 10,
      gust: 15,
      unit: 'MPS',
      speedKnots: 19.4384,
    },
    values: {},
  });
  expect(parsed.knots).toEqual({
    windUnit: 'KT',
    wind: {
      directionDegrees: 340,
      speed: 8,
      gust: 14,
      unit: 'KT',
      speedKnots: 8,
    },
    values: { windDir: 340, windSpeed: 8, oat: -1, qnh: 1013 },
  });
  expect(parsed.variable.wind).toEqual({
    directionDegrees: null,
    speed: 3,
    gust: null,
    unit: 'KT',
    speedKnots: 3,
  });
  expect(parsed.invalid).toEqual({ windUnit: null, wind: null, values: {} });
});
