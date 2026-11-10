const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { test: base, expect } = require('@playwright/test');
const { relativeUrl } = require('./coverage-scope');

// Playwright exposes JavaScript coverage for Chromium pages. Keep collection
// on the normal test page so the same test run also produces the coverage data.
const test = base.extend({
  page: async ({ page, browserName }, use, testInfo) => {
    if (process.env.EFB_COVERAGE !== '1' || browserName !== 'chromium') {
      await use(page);
      return;
    }

    await page.coverage.startJSCoverage({ resetOnNavigation: false });
    try {
      await use(page);
    } finally {
      const directory = path.resolve(__dirname, '../../coverage-raw');
      fs.mkdirSync(directory, { recursive: true });
      const output = path.join(directory, `${randomUUID()}.json`);
      if (page.isClosed()) {
        fs.writeFileSync(output, JSON.stringify({ missingPage: true, test: testInfo.title }));
        await testInfo.attach('coverage-unavailable.txt', {
          body: 'The primary page closed before its JavaScript coverage could be collected.',
          contentType: 'text/plain',
        });
      } else {
        const entries = (await page.coverage.stopJSCoverage())
          .filter((entry) => relativeUrl(entry.url));
        fs.writeFileSync(output, JSON.stringify(entries));
      }
    }
  },
});

module.exports = { test, expect };
