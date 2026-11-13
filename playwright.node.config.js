const { defineConfig } = require('@playwright/test');

// These tests use Node and direct module imports. No server or browser is started.
module.exports = defineConfig({
  testDir: './tests/node',
  testMatch: '**/*.spec.js',
  projects: [{ name: 'node' }],
  workers: 1,
  retries: 0,
  timeout: 30_000,
  outputDir: 'test-results-node/artifacts',
  reporter: [
    ['list'],
    ['json', { outputFile: 'test-results-node/results.json' }],
    ['junit', { outputFile: 'test-results-node/junit.xml' }],
  ],
});
