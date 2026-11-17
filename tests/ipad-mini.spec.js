const { test, expect } = require('./support/coverage-test');
const { applyIpadMiniScreenshotAppearance } = require('./support/ipad-mini-appearance');
const { blockExternalRequests, chooseAirport, fillWeather, openApp } = require('./support/app-helpers');

test.use({ serviceWorkers: 'block' });
test.beforeEach(async ({ context }) => blockExternalRequests(context));

for (const registration of ['SE-LTL', 'SE-MHU', 'SE-RIJ']) {
  test(`${registration}: iPad mini A17 Pro portrait touch and layout`, async ({ page }, testInfo) => {
    await page.addInitScript(() => {
      window.__testTouchStarts = 0;
      document.addEventListener('touchstart', () => { window.__testTouchStarts += 1; }, { passive: true });
    });
    await openApp(page, registration);
    await applyIpadMiniScreenshotAppearance(page);
    await chooseAirport(page, 'to', 'ESSA', '01L');
    await fillWeather(page, 'to');
    await page.locator('#landing-tab-button').tap();
    await chooseAirport(page, 'ldg', 'ESSA', '01L');
    await fillWeather(page, 'ldg');

    const viewport = { width: 744, height: 1133 };
    await test.step(`portrait: ${viewport.width} x ${viewport.height}`, async () => {
      const portrait = await page.evaluate(() => window.matchMedia('(orientation: portrait)').matches);
      expect(portrait, 'the supported iPad mini layout is portrait only').toBe(true);
      for (const [name, prefix] of [['Take-off', 'to'], ['Landing', 'ldg']]) {
        const touchStartsBefore = await page.evaluate(() => window.__testTouchStarts);
        await page.getByRole('button', { name, exact: true }).tap();
        const section = page.locator(prefix === 'to' ? '#page-takeoff' : '#page-landing');
        await expect(section).toBeVisible();
        const icao = page.locator(`#${prefix}-airport-icao`);
        await icao.tap();
        await expect(icao).toBeFocused();
        await expect(icao).toHaveValue('ESSA');
        // Focusing another field closes autocomplete and checks touch focus.
        await page.locator(`#${prefix}-oat`).tap();
        await expect(page.locator(`#${prefix}-oat`)).toBeFocused();
        const layout = await page.evaluate(() => ({
          width: window.innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
          touchStarts: window.__testTouchStarts,
          overflowingControls: [...document.querySelectorAll('main input, main select, main button')]
            .filter((element) => element.getClientRects().length > 0)
            .filter((element) => {
              const rect = element.getBoundingClientRect();
              return rect.left < -1 || rect.right > window.innerWidth + 1;
            }).map((element) => element.id || element.textContent.trim()),
        }));
        expect.soft(layout.touchStarts, 'the app must receive actual touch events').toBeGreaterThan(touchStartsBefore);
        expect.soft(layout.width, 'mobile viewport must not expand to fit overflowing content').toBeLessThanOrEqual(viewport.width + 1);
        expect.soft(layout.scrollWidth, 'page must fit horizontally').toBeLessThanOrEqual(viewport.width + 1);
        expect.soft(layout.overflowingControls, 'visible controls must fit horizontally').toEqual([]);
        await testInfo.attach(`${registration}-${prefix}-portrait`, {
          body: await page.screenshot({ fullPage: true }), contentType: 'image/png',
        });
      }
    });
  });
}
