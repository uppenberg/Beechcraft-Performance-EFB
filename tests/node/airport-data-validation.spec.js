const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');

const AIRPORT_DATABASE_PATH = path.join(__dirname, '../../data/airports.json');
const REQUIRED_FIELDS = [
  'ICAO',
  'RWY',
  'RWY Elev [ft] (B6)',
  'Slope [%](G6)',
  'RWYHDG [°](H6)',
];
const DISTANCE_FIELDS = [
  'TORA [m] (C6)',
  'TODA [m](D6)',
  'ASDA [m](E6)',
  'LDA [m](F6)',
];
const REQUIRED_NUMERIC_FIELDS = [
  'RWY Elev [ft] (B6)',
  'Slope [%](G6)',
  'RWYHDG [°](H6)',
];
const CONTROL_CHARACTERS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;
const NUMERIC_VALUE = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/;

function isNumericValue(value) {
  if (typeof value === 'number') return Number.isFinite(value);
  if (typeof value !== 'string' || !NUMERIC_VALUE.test(value.trim())) return false;
  return Number.isFinite(Number(value));
}

test('airports.json is valid and every runway follows the airport data standard', () => {
  const fileContents = fs.readFileSync(AIRPORT_DATABASE_PATH, 'utf8');
  // RFC 8259 permits parsers to ignore a UTF-8 BOM, and this file currently has one.
  const database = JSON.parse(fileContents.replace(/^\uFEFF/, ''));

  expect(database).toHaveProperty('Sheet1');
  expect(Array.isArray(database.Sheet1)).toBe(true);
  expect(database.Sheet1.length).toBeGreaterThan(0);

  const problems = [];
  database.Sheet1.forEach((runway, index) => {
    const rowLabel = `Sheet1[${index}] (${runway?.ICAO ?? '?'} ${runway?.RWY ?? '?'})`;
    if (!runway || typeof runway !== 'object' || Array.isArray(runway)) {
      problems.push(`${rowLabel}: runway entry must be an object`);
      return;
    }

    for (const field of REQUIRED_FIELDS) {
      if (runway[field] == null || String(runway[field]).trim() === '') {
        problems.push(`${rowLabel}: missing required value ${field}`);
      }
    }

    if (typeof runway.ICAO !== 'string' || !/^[A-Z0-9]{4}$/.test(runway.ICAO)) {
      problems.push(`${rowLabel}: ICAO must contain exactly four uppercase letters or digits`);
    }
    if (typeof runway.RWY !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9./-]*$/.test(runway.RWY.trim())) {
      problems.push(`${rowLabel}: RWY contains invalid characters`);
    }

    for (const [field, value] of Object.entries(runway)) {
      if (typeof value === 'string' && CONTROL_CHARACTERS.test(value)) {
        problems.push(`${rowLabel}: ${field} contains an invalid control character`);
      }
    }

    for (const field of [...REQUIRED_NUMERIC_FIELDS, ...DISTANCE_FIELDS]) {
      const value = runway[field];
      if (value == null || String(value).trim() === '') continue;
      if (!isNumericValue(value)) {
        problems.push(`${rowLabel}: ${field} must be numeric`);
      }
    }

    const heading = Number(runway['RWYHDG [°](H6)']);
    if (Number.isFinite(heading) && (heading < 0 || heading > 360)) {
      problems.push(`${rowLabel}: runway heading must be between 0 and 360 degrees`);
    }

    const hasLda = runway['LDA [m](F6)'] != null &&
      String(runway['LDA [m](F6)']).trim() !== '';
    const hasAllDeclaredDistances = DISTANCE_FIELDS.slice(0, 3).every((field) =>
      runway[field] != null && String(runway[field]).trim() !== ''
    );
    if (!hasLda && !hasAllDeclaredDistances) {
      problems.push(`${rowLabel}: provide LDA or all of TORA, TODA and ASDA`);
    }
  });

  expect(problems, problems.slice(0, 30).join('\n')).toEqual([]);
});
