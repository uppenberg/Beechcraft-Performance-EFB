const { test, expect } = require('./support/coverage-test');
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

function makeTafmetarReport(icao, minutesAgo, wind) {
  const observedAt = new Date(Date.now() - minutesAgo * 60_000);
  const observationTime = [
    String(observedAt.getUTCDate()).padStart(2, '0'),
    String(observedAt.getUTCHours()).padStart(2, '0'),
    String(observedAt.getUTCMinutes()).padStart(2, '0'),
  ].join('');
  return `${icao} ${observationTime}Z ${wind} 15/10 Q1013=`;
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

  await page.getByRole('button', { name: 'Take-off', exact: true }).click();
  await chooseAirport(page, 'to', 'ESSA', '01L');
  await page.locator('#landing-tab-button').click();
  await chooseAirport(page, 'ldg', 'ESSA', '01L');

  await stubMetar(page, '02004G25MPS');
  for (const [prefix, card] of [['to', '#card-wind-check'], ['ldg', '#card-wind-check-ldg']]) {
    await page.evaluate((phase) => BeechcraftApp.results.fetchMetarForAirport(phase), prefix);
    await expect(page.locator(card)).toHaveCSS('border-color', 'rgb(248, 81, 73)');
  }

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

  await page.getByRole('button', { name: 'Take-off', exact: true }).click();
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

test('a METAR direction outside 0–360 cannot populate either wind field', async ({ page }) => {
  await openApp(page, 'SE-LTL');
  for (const prefix of ['to', 'ldg']) {
    const direction = page.locator(`#${prefix}-wind-dir`);
    const previous = await direction.inputValue();
    const applied = await page.evaluate((phase) =>
      BeechcraftApp.results.populateWeatherFromMetar('METAR ESSA 011230Z 36108KT 15/10 Q1013', phase), prefix);
    expect(applied).toBe(false);
    await expect(direction).toHaveValue(previous);
  }
});

test('shared METAR parser normalizes wind once and keeps MPS out of calculator values', async ({ page }) => {
  await openApp(page, 'SE-LTL');
  const parsed = await page.evaluate(() => ({
    mps: BeechcraftApp.metar.MetarWeather.parse('METAR ESSA 011230Z 02010G15MPS 15/10 Q1013'),
    knots: BeechcraftApp.metar.MetarWeather.parse('METAR ESSA 011230Z 34008G14KT M01/M03 A2992'),
    variable: BeechcraftApp.metar.MetarWeather.parse('METAR ESSA 011230Z VRB03KT 15/10 Q1013'),
    invalid: BeechcraftApp.metar.MetarWeather.parse(null),
    calm: BeechcraftApp.metar.MetarWeather.parse('METAR ESSA 011230Z 00000KT 15/10 Q1013'),
  }));

  expect(parsed.mps).toEqual({
    windUnit: 'MPS',
    wind: {
      directionDegrees: 20,
      speed: 10,
      gust: 15,
      unit: 'MPS',
      speedKnots: 19.4384,
      gustKnots: 15 * 1.94384,
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
      gustKnots: 14,
    },
    values: { windDir: 340, windSpeed: 8, oat: -1, qnh: 1013 },
  });
  expect(parsed.variable.wind).toEqual({
    directionDegrees: null,
    speed: 3,
    gust: null,
    unit: 'KT',
    speedKnots: 3,
    gustKnots: null,
  });
  expect(parsed.invalid).toEqual({ windUnit: null, wind: null, values: {} });
  expect(parsed.calm).toMatchObject({
    windUnit: 'KT',
    wind: { directionDegrees: 0, speed: 0, gust: null, unit: 'KT', speedKnots: 0 },
    values: { windDir: 0, windSpeed: 0, oat: 15, qnh: 1013 },
  });
});

test('METAR validation rejects station mismatch, stale observations and invalid timestamps', async ({ page }) => {
  await openApp(page, 'SE-LTL');
  const result = await page.evaluate(() => {
    const validate = BeechcraftApp.results.validateMetar;
    const now = new Date();
    const age = (minutes) => {
      const observed = new Date(now.getTime() - minutes * 60_000);
      const stamp = [
        String(observed.getUTCDate()).padStart(2, '0'),
        String(observed.getUTCHours()).padStart(2, '0'),
        String(observed.getUTCMinutes()).padStart(2, '0'),
      ].join('');
      return `METAR ESSA ${stamp}Z 02008KT 15/10 Q1013`;
    };
    const capture = (operation) => {
      try { operation(); return null; } catch (error) { return error.message; }
    };
    return {
      fresh: validate(age(10), 'ESSA').text,
      mismatch: capture(() => validate(age(10).replace('ESSA', 'EFHK'), 'ESSA')),
      stale: capture(() => validate(age(70), 'ESSA')),
      invalidTime: capture(() => validate('METAR ESSA 012460Z 02008KT 15/10 Q1013', 'ESSA')),
    };
  });
  expect(result.fresh).toContain('02008KT');
  expect(result.mismatch).toContain('does not match ESSA');
  expect(result.stale).toContain('too old');
  expect(result.invalidTime).toContain('invalid observation time');
});

test('latest MET Norway report selects the freshest valid report for the requested station', async ({ page }) => {
  await openApp(page, 'SE-LTL');
  const older = makeTafmetarReport('ESSA', 45, '01003KT');
  const latest = makeTafmetarReport('ESSA', 6, '33008KT');
  const otherStation = makeTafmetarReport('EFHK', 2, '09012KT');
  const result = await page.evaluate(({ reports, staleReport }) => {
    const validateLatest = BeechcraftApp.results.validateLatestMetar;
    const capture = (operation) => {
      try { operation(); return null; } catch (error) { return error.message; }
    };
    return {
      latest: validateLatest(reports, 'ESSA'),
      staleError: capture(() => validateLatest(staleReport, 'ESSA')),
    };
  }, {
    reports: `${older}\n${otherStation}\n${latest}`,
    staleReport: makeTafmetarReport('ESSA', 70, '02008KT'),
  });

  expect(result.latest.text).toContain('33008KT');
  expect(result.latest.text).not.toContain('01003KT');
  expect(result.latest.text).not.toContain('09012KT');
  expect(result.latest.ageMinutes).toBeLessThan(10);
  expect(result.staleError).toContain('too old');
});

test('MET Norway is tried first and its newest report is used without fallback', async ({ page }) => {
  const requests = [];
  await page.route('https://api.met.no/**', (route) => {
    requests.push('MET Norway');
    return route.fulfill({
      status: 200,
      contentType: 'text/plain',
      body: [
        makeTafmetarReport('ESSA', 40, '01003KT'),
        makeTafmetarReport('ESSA', 5, '33008KT'),
      ].join('\n'),
    });
  });
  await page.route('**/metar-proxy.uppenberg1.workers.dev/**', (route) => {
    requests.push('Cloudflare Worker');
    return route.fulfill({ status: 200, body: makeCurrentMetar('02008KT') });
  });
  await page.route('**/api/reports/metar**', (route) => {
    requests.push('Netlify Proxy');
    return route.fulfill({ status: 200, body: makeCurrentMetar('02008KT') });
  });
  await openApp(page, 'SE-LTL');
  requests.length = 0;

  await page.evaluate(async () => {
    BeechcraftApp.state.AppState.airportSelection.to.icao = 'ESSA';
    await BeechcraftApp.results.fetchMetarForAirport('to');
  });

  await expect(page.locator('#to-metar-display')).toContainText('33008KT');
  expect(requests[0]).toBe('MET Norway');
  expect(requests).not.toContain('Cloudflare Worker');
  expect(requests).not.toContain('Netlify Proxy');
});

test('stale MET Norway data and an invalid Worker report fall through to Netlify', async ({ page }) => {
  const requests = [];
  await page.route('https://api.met.no/**', (route) => {
    requests.push('MET Norway');
    return route.fulfill({
      status: 200,
      contentType: 'text/plain',
      body: makeTafmetarReport('ESSA', 70, '01003KT'),
    });
  });
  await page.route('**/metar-proxy.uppenberg1.workers.dev/**', (route) => {
    requests.push('Cloudflare Worker');
    return route.fulfill({ status: 200, body: makeCurrentMetar('02008KT').replace('ESSA', 'EFHK') });
  });
  await page.route('**/api/reports/metar**', (route) => {
    requests.push('Netlify Proxy');
    return route.fulfill({ status: 200, body: makeCurrentMetar('09008KT') });
  });
  await openApp(page, 'SE-LTL');
  requests.length = 0;

  await page.evaluate(async () => {
    BeechcraftApp.state.AppState.airportSelection.to.icao = 'ESSA';
    await BeechcraftApp.results.fetchMetarForAirport('to');
  });

  await expect(page.locator('#to-metar-display')).toContainText('09008KT');
  expect(requests).toEqual(['MET Norway', 'Cloudflare Worker', 'Netlify Proxy']);
});

test('runway suggestions handle variable, calm, pure crosswind and reciprocal runway wind', async ({ page }) => {
  await openApp(page, 'SE-RIJ');
  await page.locator('#to-airport-icao').fill('EETN');
  const states = await page.evaluate(() => {
    const suggest = BeechcraftApp.airports.suggestRunwayFromMetar;
    suggest('METAR EETN 011230Z VRB03KT 15/10 Q1013', 'to');
    const variable = document.getElementById('to-runway-suggestion-text').textContent;
    suggest('METAR EETN 011230Z 00000KT 15/10 Q1013', 'to');
    const calm = document.getElementById('to-runway-suggestion-text').textContent;
    suggest('METAR EETN 011230Z 17008KT 15/10 Q1013', 'to');
    const crosswind = document.getElementById('to-runway-suggestion-text').textContent;
    suggest('METAR EETN 011230Z 26008KT 15/10 Q1013', 'to');
    const tailwindOpposite = document.getElementById('to-runway-suggestion-text').textContent;
    return { variable, calm, crosswind, tailwindOpposite };
  });
  expect(states.variable).toContain('variable or unavailable');
  expect(states.calm).toContain('calm');
  expect(states.crosswind).toContain('No runway has a headwind');
  expect(states.tailwindOpposite).toContain('METAR suggests RWY 26');
});

test('an invalid fetched METAR leaves manually entered weather unchanged', async ({ page }) => {
  await openApp(page, 'SE-LTL');
  await page.route('**/api/reports/metar**', (route) => route.fulfill({
    status: 200,
    contentType: 'text/plain',
    body: 'METAR EGLL 011230Z 02008KT 15/10 Q1013',
  }));
  await page.locator('#to-wind-dir').fill('090');
  await page.locator('#to-wind-spd').fill('7');
  await page.locator('#to-oat').fill('3');
  await page.locator('#to-qnh').fill('1009');
  await page.locator('#to-airport-icao').fill('ESSA');
  await page.locator('#to-airport-rwy').selectOption('01L');
  await expect(page.locator('#to-metar-display')).toContainText('unavailable or invalid from all sources');
  await expect(page.locator('#to-wind-dir')).toHaveValue('90');
  await expect(page.locator('#to-wind-spd')).toHaveValue('7');
  await expect(page.locator('#to-oat')).toHaveValue('3');
  await expect(page.locator('#to-qnh')).toHaveValue('1009');
});
