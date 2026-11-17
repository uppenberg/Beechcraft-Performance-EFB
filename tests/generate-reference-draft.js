const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('@playwright/test');
const { createTestServer } = require('./support/server');

const ROOT = path.resolve(__dirname, '..');
const REFERENCES_DIR = path.join(ROOT, 'reference-drafts');
const registrations = [
  { model: 'BE20', registration: 'SE-LTL', takeoffFlaps: 'APP', landingFlaps: 'DOWN', takeoffMass: '12000', landingMass: '12000' },
  { model: 'B190', registration: 'SE-MHU', takeoffFlaps: 'TAKE', landingFlaps: 'DOWN', takeoffMass: '15000', landingMass: '15000' },
  { model: 'C56X', registration: 'SE-RIJ', takeoffFlaps: '15', landingFlaps: '35', takeoffMass: '17500', landingMass: '17000' },
];

async function startServer() {
  const server = createTestServer();
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  return server;
}

async function waitForInit(page) {
  await page.waitForFunction(() => Boolean(window.__testAppInitPromise), null, { timeout: 30_000 });
  await page.evaluate(() => window.__testAppInitPromise);
  const errorText = await page.locator('#airport-selection-error').textContent();
  if (errorText.includes('Could not initialize')) throw new Error(errorText);
}

async function captureModel(browser, baseURL, aircraft) {
  const context = await browser.newContext();
  const appOrigin = new URL(baseURL).origin;
  await context.route('**/*', (route) => {
    return new URL(route.request().url()).origin === appOrigin ? route.continue() : route.abort();
  });
  const page = await context.newPage();
  await page.addInitScript((registration) => {
    localStorage.setItem('selected_reg', registration);
    const nativeAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function (type, listener, options) {
      if (this === document && type === 'DOMContentLoaded' && listener?.name === 'init') {
        const observedInit = function (event) {
          window.__testAppInitPromise = Promise.resolve(listener.call(this, event))
            .then(() => true, (error) => {
              window.__testAppInitError = String(error?.stack || error);
              return false;
            });
          return window.__testAppInitPromise;
        };
        return nativeAddEventListener.call(this, type, observedInit, options);
      }
      return nativeAddEventListener.call(this, type, listener, options);
    };
  }, aircraft.registration);
  await page.goto(baseURL);
  await waitForInit(page);

  await page.locator('#to-airport-icao').fill('ESSA');
  await page.locator('#to-airport-rwy').selectOption('01L');
  const takeoffWeather = {
    'to-wind-dir': '020', 'to-wind-spd': '8',
    'to-oat': aircraft.model === 'C56X' ? '0' : '15', 'to-qnh': '1013',
  };
  for (const [id, value] of Object.entries(takeoffWeather)) await page.locator(`#${id}`).fill(value);
  await page.locator('#to-mass').evaluate((element, mass) => {
    element.value = mass;
    element.dispatchEvent(new Event('input', { bubbles: true }));
  }, aircraft.takeoffMass);
  await page.locator('#to-flaps').selectOption(aircraft.takeoffFlaps);
  if (aircraft.model === 'C56X') {
    await page.locator('#to-rwcc').selectOption('6');
    await page.locator('#to-anti-ice').selectOption('ON');
    await page.locator('#to-reversers').selectOption('AVAILABLE');
    await page.locator('#to-deice').selectOption('NO');
  } else if (aircraft.model === 'B190') {
    await page.locator('#to-technique').selectOption('Static T/O power');
  }
  await page.evaluate(() => BeechcraftApp.airports.switchTab('landing'));
  await page.locator('#ldg-airport-icao').fill('ESSA');
  await page.locator('#ldg-airport-rwy').selectOption('01L');
  const landingWeather = {
    'ldg-wind-dir': '020', 'ldg-wind-spd': '8', 'ldg-oat': '15', 'ldg-qnh': '1013',
  };
  for (const [id, value] of Object.entries(landingWeather)) await page.locator(`#${id}`).fill(value);
  await page.locator('#ldg-mass').evaluate((element, mass) => {
    element.value = mass;
    element.dispatchEvent(new Event('input', { bubbles: true }));
  }, aircraft.landingMass);
  if (aircraft.model === 'C56X') {
    await page.locator('#ldg-rwcc').selectOption('6');
    await page.locator('#ldg-anti-ice').selectOption('OFF');
    await page.locator('#ldg-reversers').selectOption('AVAILABLE');
  } else {
    await page.locator('#ldg-flaps').selectOption(aircraft.landingFlaps);
  }
  await page.waitForTimeout(100);

  const outputIds = aircraft.model === 'C56X'
    ? ['c56x-tora-status', 'c56x-toda-status', 'c56x-asda-status',
      'c56x-v1-check', 'res-ldg-afm-distance', 'res-ldg-required-distance',
      'res-ldg-vref-vapp', 'res-ldg-max-weight']
    : ['check-tor-val', 'check-tod-val', 'check-asd-val', 'res-to-v1', 'res-to-vr', 'res-to-v2',
      'res-ldg-distup', 'res-ldg-distdown', 'res-ldg-vrefup', 'res-ldg-vrefdown'];
  const outputs = await page.evaluate((ids) => Object.fromEntries(ids.map((id) => [
    id,
    document.getElementById(id)?.textContent?.trim() ?? null,
  ])), outputIds);
  if (Object.values(outputs).some((value) => !value || value === '-')) {
    throw new Error(`${aircraft.model} reference scenario produced incomplete outputs: ${JSON.stringify(outputs)}`);
  }
  const displayedSetup = await page.evaluate(() => {
    const value = (id) => document.getElementById(id)?.value ?? null;
    return {
      takeoffRwcc: value('to-rwcc'),
      landingRwcc: value('ldg-rwcc'),
      takeoffAntiIce: value('to-anti-ice'),
      landingAntiIce: value('ldg-anti-ice'),
      takeoffReversers: value('to-reversers'),
      landingReversers: value('ldg-reversers'),
      takeoffDeiceFluid: value('to-deice'),
      takeoffTechnique: value('to-technique'),
    };
  });

  const reference = {
    model: aircraft.model,
    registration: aircraft.registration,
    inputs: {
      airport: 'ESSA', runway: '01L', windDirectionDeg: 20, windSpeedKnots: 8,
      takeoffOatC: aircraft.model === 'C56X' ? 0 : 15, landingOatC: 15, qnhHpa: 1013,
      takeoffMassLb: Number(aircraft.takeoffMass),
      landingMassLb: Number(aircraft.landingMass), takeoffFlaps: aircraft.takeoffFlaps,
      landingFlaps: aircraft.landingFlaps,
      takeoffRwcc: displayedSetup.takeoffRwcc,
      landingRwcc: displayedSetup.landingRwcc,
      takeoffAntiIce: displayedSetup.takeoffAntiIce,
      landingAntiIce: aircraft.model === 'C56X' ? displayedSetup.landingAntiIce : null,
      takeoffReversers: aircraft.model === 'C56X' ? displayedSetup.takeoffReversers : null,
      landingReversers: aircraft.model === 'C56X' ? displayedSetup.landingReversers : null,
      takeoffDeiceFluid: aircraft.model === 'C56X' ? displayedSetup.takeoffDeiceFluid : null,
      takeoffTechnique: aircraft.model === 'B190' ? displayedSetup.takeoffTechnique : null,
    },
    outputs,
  };

  if (aircraft.model === 'C56X') {
    reference.algorithmicInputs = {
      takeoff: {
        qnhHpa: 1013, fieldElevationFt: 98.6, oatC: 0, weightLb: 17_500,
        windDirectionDeg: 20, windSpeedKnots: 8, runwayHeadingDeg: 2,
        runwaySlopePercent: 0.2, runwayConditionCode: '6', antiIce: 'ON', flaps: 15,
        deiceFluidApplied: false,
      },
      landing: {
        qnhHpa: 1013, fieldElevationFt: 98.6, oatC: 15, weightLb: 17_000,
        headwindKnots: 8 * Math.cos(18 * Math.PI / 180), runwaySlopePercent: 0.2,
        runwayConditionCode: '6', antiIce: 'OFF', reverserStatus: 'AVAILABLE',
      },
    };
    reference.algorithmicOutputs = await page.evaluate((inputs) => ({
      takeoff: getC56xTakeoffFieldLengths(inputs.takeoff),
      landing: getC56xLandingPerformance(inputs.landing),
    }), reference.algorithmicInputs);
  }

  await context.close();
  return reference;
}

async function main() {
  const server = await startServer();
  const address = server.address();
  const baseURL = `http://127.0.0.1:${address.port}`;
  const launchOptions = { headless: true };
  if (process.env.EFB_CHROME_CHANNEL) launchOptions.channel = process.env.EFB_CHROME_CHANNEL;
  else if (process.platform === 'win32') launchOptions.channel = 'chrome';
  const browser = await chromium.launch(launchOptions);
  try {
    const models = [];
    for (const aircraft of registrations) models.push(await captureModel(browser, baseURL, aircraft));

    const report = {
      generatedAt: new Date().toISOString(),
      appVersion: fs.readFileSync(path.join(ROOT, 'version.js'), 'utf8').match(/APP_VERSION\s*=\s*'([^']+)'/)?.[1] || 'unknown',
      status: 'DRAFT — generated by current app code; independently verify against the current AFM/workbook before approval.',
      references: models,
    };
    fs.mkdirSync(REFERENCES_DIR, { recursive: true });
    const filename = `reference-draft-${new Date().toISOString().replaceAll(':', '').replaceAll('.', '-')}.json`;
    const outputPath = path.join(REFERENCES_DIR, filename);
    fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    process.stdout.write(`Created unapproved reference draft: ${path.relative(ROOT, outputPath)}\n`);
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error}\n`);
  process.exitCode = 1;
});
