const { defineConfig, devices } = require('@playwright/test');

const port = Number(process.env.TEST_PORT || 4173);
const baseURL = `http://127.0.0.1:${port}`;
const chromeChannel = process.env.EFB_CHROME_CHANNEL ||
  (process.platform === 'win32' ? 'chrome' : undefined);
const projects = [
  {
    name: 'chromium',
    use: {
      ...devices['Desktop Chrome'],
      ...(chromeChannel ? { channel: chromeChannel } : {}),
    },
  },
];
if (process.env.CI || process.env.EFB_RUN_WEBKIT === '1') {
  projects.push({ name: 'webkit', use: { ...devices['Desktop Safari'] } });
}

module.exports = defineConfig({
  testDir: './tests',
  testMatch: ['**/*.spec.js'],
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  use: {
    baseURL,
    headless: true,
    serviceWorkers: 'allow',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects,
  webServer: {
    command: `node tests/support/server.js`,
    url: `${baseURL}/__test__/health`,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
    env: { TEST_PORT: String(port) },
  },
});
