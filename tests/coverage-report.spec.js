const path = require('node:path');
const { createCoverageMap } = require('istanbul-lib-coverage');
const { test, expect } = require('./support/coverage-test');
const { convert } = require('./support/coverage-report');
const { root, listFiles, relativeUrl } = require('./support/coverage-scope');

test('coverage scope includes new app modules and excludes other origins and data', () => {
  const origin = `http://127.0.0.1:${process.env.TEST_PORT || '4173'}`;
  expect(listFiles()).toContain(path.join(root, 'js', 'app.js'));
  expect(listFiles()).toContain(path.join(root, 'data', 'c56x', 'calculations.js'));
  expect(relativeUrl(`${origin}/js/new-module.js`)).toBe('js/new-module.js');
  expect(relativeUrl(`${origin}/data/c56x/landing-calculations.js`)).toBe('data/c56x/landing-calculations.js');
  expect(relativeUrl(`${origin}/data/c56x/landing-distance-flaps35.js`)).toBeNull();
  expect(relativeUrl('https://example.com/js/app.js')).toBeNull();
});

test('unloaded files report zero coverage and separate observations merge', async () => {
  const file = path.join(root, 'js', 'coverage-example.js');
  const source = 'function first() {\n  return 1;\n}\nfunction second() {\n  return 2;\n}\n';
  const first = source.indexOf('function first');
  const second = source.indexOf('function second');
  const empty = [{ functionName: '(empty-report)', ranges: [{ startOffset: 0, endOffset: source.length, count: 0 }], isBlockCoverage: false }];
  const noCoverage = createCoverageMap(await convert(file, source, empty)).getCoverageSummary().toJSON();
  expect(noCoverage.lines.total).toBeGreaterThan(0);
  expect(noCoverage.lines.covered).toBe(0);

  const observation = (firstCount, secondCount) => [
    { functionName: '', ranges: [{ startOffset: 0, endOffset: source.length, count: 1 }], isBlockCoverage: true },
    { functionName: 'first', ranges: [{ startOffset: first, endOffset: second, count: firstCount }], isBlockCoverage: true },
    { functionName: 'second', ranges: [{ startOffset: second, endOffset: source.length, count: secondCount }], isBlockCoverage: true },
  ];
  const combined = createCoverageMap(await convert(file, source, observation(1, 0)));
  const before = combined.getCoverageSummary().lines.covered;
  combined.merge(await convert(file, source, observation(0, 1)));
  expect(combined.getCoverageSummary().lines.covered).toBeGreaterThan(before);
});
