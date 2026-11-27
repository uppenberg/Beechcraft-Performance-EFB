const { test, expect } = require('./support/coverage-test');
const { openApp, stubMetarRequests, waitForAppInitialization } = require('./support/app-helpers');

test.use({ serviceWorkers: 'block' });

for (const [registration, takeoffMass, landingMass, defaultLanding] of [
  ['SE-LTL', '11800', '11100', '12500'],
  ['SE-MHU', '15800', '15000', '16100'],
  ['SE-RIJ', '19000', '17800', '18700'],
]) {
  test(`start next leg transfers inputs and refreshes METAR for ${registration}`, async ({ page, context }) => {
    const requests = [];
    await stubMetarRequests(context, (icao) => requests.push(icao));
    await openApp(page, registration);
    await page.locator('#to-airport-icao').fill('ESSA');
    await page.locator('#to-airport-rwy').selectOption('01L');
    await page.locator('#to-mass').fill(takeoffMass);
    await page.locator('#to-rwcc').selectOption('5');
    await expect(page.locator('#start-next-leg')).toBeHidden();
    await page.locator('#landing-tab-button').click();
    await page.locator('#ldg-airport-icao').fill('ESNU');
    await page.locator('#ldg-airport-rwy').selectOption('14');
    await page.locator('#ldg-mass').fill(landingMass);
    await page.locator('#ldg-rwcc').selectOption('4');
    await expect(page.locator('#ldg-metar-display')).toContainText('ESNU');
    await page.locator('#start-next-leg').click();
    const dialog = page.locator('#next-leg-dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('ESSA → ESNU');
    await expect(dialog).toContainText('ESNU → ESSA');
    await expect(dialog).toContainText(`${takeoffMass} → ${landingMass}`);
    await expect(dialog).toContainText(`${landingMass} → ${defaultLanding}`);
    await expect(dialog).toContainText('5 → 4 (previous landing RWCC)');
    await expect(dialog).toContainText('4 → 5 (previous take-off RWCC)');
    await dialog.getByRole('button', { name: 'No', exact: true }).click();
    await expect(page.locator('#to-airport-icao')).toHaveValue('ESSA');
    await expect(page.locator('#ldg-airport-icao')).toHaveValue('ESNU');
    await expect(page.locator('#ldg-mass')).toHaveValue(landingMass);
    await expect(page.locator('#to-rwcc')).toHaveValue('5');
    await expect(page.locator('#ldg-rwcc')).toHaveValue('4');
    await page.locator('#start-next-leg').click();
    requests.length = 0;
    await page.locator('#next-leg-confirm').click();
    await expect(page.locator('#page-takeoff')).toBeVisible();
    await expect(page.locator('#to-airport-icao')).toHaveValue('ESNU');
    await expect(page.locator('#ldg-airport-icao')).toHaveValue('ESSA');
    await expect(page.locator('#to-airport-rwy')).toHaveValue('');
    await expect(page.locator('#ldg-airport-rwy')).toHaveValue('');
    await expect(page.locator('#to-mass')).toHaveValue(landingMass);
    await expect(page.locator('#ldg-mass')).toHaveValue(defaultLanding);
    await expect(page.locator('#to-rwcc')).toHaveValue('4');
    await expect(page.locator('#ldg-rwcc')).toHaveValue('5');
    if (registration !== 'SE-RIJ') {
      const workbookRwcc = await page.evaluate(() => {
        const app = window.BeechcraftApp;
        return app.workbookEngine.getOutputVal('Take-off', app.state.CELL_MAPPING.takeoff.inputs.rwcc, false);
      });
      expect(Number(workbookRwcc)).toBe(4);
      const landingWorkbookRwcc = await page.evaluate(() => {
        const app = window.BeechcraftApp;
        return app.workbookEngine.getOutputVal('Landing', app.state.CELL_MAPPING.landing.inputs.rwcc, false);
      });
      expect(Number(landingWorkbookRwcc)).toBe(5);
    }
    await expect.poll(() => requests.includes('ESNU') && requests.includes('ESSA')).toBeTruthy();
    await expect(page.locator('#to-metar-display')).toContainText('ESNU');
    await expect(page.locator('#ldg-metar-display')).toContainText('ESSA');
    await page.reload();
    await waitForAppInitialization(page);
    await expect(page.locator('#to-airport-icao')).toHaveValue('ESNU');
    await expect(page.locator('#ldg-airport-icao')).toHaveValue('ESSA');
    await expect(page.locator('#to-mass')).toHaveValue(landingMass);
    await expect(page.locator('#ldg-mass')).toHaveValue(defaultLanding);
    await expect(page.locator('#to-rwcc')).toHaveValue('4');
    await expect(page.locator('#ldg-rwcc')).toHaveValue('5');
  });
}

test('invalid or out-of-range carry-forward cannot start a leg', async ({ page }) => {
  await openApp(page, 'SE-LTL');
  await page.locator('#landing-tab-button').click();
  await page.locator('#start-next-leg').click();
  await expect(page.locator('#next-leg-error')).toContainText('Select valid');
  await expect(page.locator('#next-leg-confirm')).toBeDisabled();
  await page.locator('#next-leg-dialog').getByRole('button', { name: 'No', exact: true }).click();
  await page.locator('#ldg-airport-icao').fill('ESNU');
  await page.getByRole('button', { name: 'Take-off', exact: true }).click();
  await page.locator('#to-airport-icao').fill('ESSA');
  await page.locator('#landing-tab-button').click();
  await page.locator('#ldg-mass').fill('9000');
  await page.locator('#start-next-leg').click();
  await expect(page.locator('#next-leg-error')).toContainText('outside the take-off range');
  await expect(page.locator('#next-leg-confirm')).toBeDisabled();
});

test('same-airport leg clears both runways and refreshes both METARs', async ({ page, context }) => {
  const requests = [];
  await stubMetarRequests(context, (icao) => requests.push(icao));
  await openApp(page, 'SE-LTL');
  await page.locator('#to-airport-icao').fill('ESSA');
  await page.locator('#to-airport-rwy').selectOption('01L');
  await page.locator('#landing-tab-button').click();
  await page.locator('#ldg-airport-icao').fill('ESSA');
  await page.locator('#ldg-airport-rwy').selectOption('19R');
  await expect(page.locator('#ldg-metar-display')).toContainText('ESSA');
  await page.locator('#start-next-leg').click();
  const before = requests.length;
  await page.locator('#next-leg-confirm').click();
  await expect(page.locator('#to-airport-rwy')).toHaveValue('');
  await expect(page.locator('#ldg-airport-rwy')).toHaveValue('');
  await expect.poll(() => requests.slice(before)).toEqual(['ESSA', 'ESSA']);
});
