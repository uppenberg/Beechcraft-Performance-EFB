const { test, expect } = require('@playwright/test');

let limits;
test.beforeAll(async () => {
  limits = await import('../../js/performance-limits.js');
});

test('missing, non-finite and workbook error values cannot become valid numbers', () => {
  for (const value of [null, undefined, '', '  ', '#ERROR!', '#VALUE!', NaN, Infinity, -Infinity, {}, [], true]) {
    expect(limits.finiteNumber(value), String(value)).toBeNull();
  }
  expect(limits.finiteNumber(0)).toBe(0);
  expect(limits.finiteNumber(' -12.5 ')).toBe(-12.5);
});

for (const [distance, expected] of [[99.99, false], [100, false], [100.01, true]]) {
  test(`distance ${distance} against limit 100 uses full precision`, () => {
    expect(limits.exceedsDistanceLimit(distance, 100)).toBe(expected);
  });
}

test('missing actual distance or available distance produces an unknown decision', () => {
  for (const value of [null, undefined, '', '#VALUE!', Infinity]) {
    expect(limits.exceedsDistanceLimit(value, 100)).toBeNull();
    expect(limits.exceedsDistanceLimit(100, value)).toBeNull();
  }
});

for (const [label, headwind, crosswind, expected] of [
  ['zero headwind and crosswind at limit', 0, 25, 'normal'],
  ['zero headwind and crosswind above limit', 0, 25.01, 'red'],
  ['headwind and crosswind at limit', 5, 25, 'normal'],
  ['crosswind above limit', 5, 25.01, 'red'],
  ['tailwind below ten knots', -9.99, 0, 'amber'],
  ['tailwind at ten knots', -10, 0, 'amber'],
  ['tailwind above ten knots', -10.01, 0, 'red'],
  ['crosswind exceedance with tailwind', -5, 25.01, 'red'],
  ['formatted tailwind at limit', '10 TW', 0, 'amber'],
  ['formatted tailwind above limit', '10.01 TW', 0, 'red'],
]) {
  test(`wind status: ${label}`, () => {
    expect(limits.windLimitStatus(headwind, crosswind, 25)).toBe(expected);
  });
}
