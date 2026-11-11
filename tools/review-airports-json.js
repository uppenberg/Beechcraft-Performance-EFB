#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const FILE = path.join(ROOT, 'data', 'airports.json');
const REQUIRED_FIELDS = [
  'ICAO',
  'RWY',
  'RWY Elev [ft] (B6)',
  'Slope [%](G6)',
  'RWYHDG [°](H6)',
];
const NUMERIC_FIELDS = [
  'RWY Elev [ft] (B6)',
  'TORA [m] (C6)',
  'TODA [m](D6)',
  'ASDA [m](E6)',
  'LDA [m](F6)',
  'Slope [%](G6)',
  'RWYHDG [°](H6)',
  'min climb gradient OEI(I6)',
];
const NUMERIC_VALUE = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/;
const RUNWAY_IDENTIFIER = /^[A-Za-z0-9][A-Za-z0-9./-]*$/;

function parseMode(args) {
  const modes = args.filter((arg) => ['--fix', '--check'].includes(arg));
  const unknown = args.filter((arg) => !['--fix', '--check'].includes(arg));
  if (unknown.length || modes.length > 1) {
    process.stderr.write(
      'Usage: node tools/review-airports-json.js [--fix | --check]\n'
    );
    process.exit(2);
  }
  return modes[0] || 'review';
}

function normalizeRunway(value) {
  if (typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 36) {
    return String(value).padStart(2, '0');
  }

  if (typeof value === 'string') {
    const match = value.match(/^([1-9])([LCR]?)$/i);
    if (match) return `0${match[1]}${match[2]}`;
  }

  return null;
}

function isNumericValue(value) {
  if (typeof value === 'number') return Number.isFinite(value);
  if (typeof value !== 'string' || !NUMERIC_VALUE.test(value.trim())) return false;
  return Number.isFinite(Number(value));
}

function inspectDatabase(database) {
  const findings = [];
  const formatChanges = [];

  if (!database || typeof database !== 'object' || Array.isArray(database)) {
    return { findings: ['Root must be a JSON object containing Sheet1.'], formatChanges };
  }
  if (Object.keys(database).length !== 1 || !Array.isArray(database.Sheet1)) {
    return { findings: ['Root must contain exactly one key, Sheet1, with an array value.'], formatChanges };
  }
  if (database.Sheet1.length === 0) findings.push('Sheet1 contains no runway records.');

  const keys = new Map();
  database.Sheet1.forEach((row, index) => {
    const rowNumber = index + 2;
    if (!row || typeof row !== 'object' || Array.isArray(row)) {
      findings.push(`Row ${rowNumber}: runway entry must be an object.`);
      return;
    }

    for (const field of REQUIRED_FIELDS) {
      if (row[field] == null || String(row[field]).trim() === '') {
        findings.push(`Row ${rowNumber}: missing required value ${field}.`);
      }
    }

    if (typeof row.ICAO !== 'string' || !/^[A-Z0-9]{4}$/.test(row.ICAO)) {
      findings.push(`Row ${rowNumber}: ICAO must contain four uppercase letters or digits.`);
    }

    const suggestedRunway = normalizeRunway(row.RWY);
    const runway = suggestedRunway || row.RWY;
    if (suggestedRunway !== null && suggestedRunway !== row.RWY) {
      formatChanges.push({ rowNumber, before: row.RWY, after: suggestedRunway });
    }
    if (typeof runway !== 'string' || !RUNWAY_IDENTIFIER.test(runway)) {
      findings.push(`Row ${rowNumber}: invalid runway identifier ${String(row.RWY)}.`);
    } else if (/^[1-9]$/.test(runway)) {
      findings.push(`Row ${rowNumber}: runway ${runway} needs a leading zero.`);
    }

    for (const [field, value] of Object.entries(row)) {
      if (typeof value !== 'string') {
        findings.push(`Row ${rowNumber}: ${field} must be a string (found ${value === null ? 'null' : typeof value}).`);
      }
    }

    for (const field of NUMERIC_FIELDS) {
      const value = row[field];
      if (value == null || String(value).trim() === '') continue;
      if (!isNumericValue(value)) findings.push(`Row ${rowNumber}: ${field} must be numeric.`);
    }

    const heading = Number(row['RWYHDG [°](H6)']);
    if (Number.isFinite(heading) && (heading < 0 || heading > 360)) {
      findings.push(`Row ${rowNumber}: runway heading must be between 0 and 360 degrees.`);
    }

    if (typeof row.ICAO === 'string' && typeof runway === 'string') {
      const intersection = typeof row.Intersection === 'string' ? row.Intersection : '';
      const key = `${row.ICAO}\u0000${runway}\u0000${intersection}`;
      if (keys.has(key)) {
        findings.push(`Row ${rowNumber}: duplicate runway key also appears on row ${keys.get(key)}.`);
      } else {
        keys.set(key, rowNumber);
      }
    }
  });

  return { findings, formatChanges };
}

function writeDatabase(database, originalText, hadBom) {
  const hadTrailingNewline = /(?:\r?\n)$/.test(originalText);
  const newline = originalText.includes('\r\n') ? '\r\n' : '\n';
  let output = JSON.stringify(database, null, 4).replace(/\n/g, newline);
  if (hadTrailingNewline) output += newline;
  if (hadBom) output = `\uFEFF${output}`;

  const temporaryFile = `${FILE}.tmp`;
  try {
    fs.writeFileSync(temporaryFile, output, 'utf8');
    fs.renameSync(temporaryFile, FILE);
  } catch (error) {
    if (fs.existsSync(temporaryFile)) fs.unlinkSync(temporaryFile);
    throw error;
  }
}

function printReport(rowCount, report, mode, changedCount) {
  process.stdout.write(`Airport JSON review: ${path.relative(ROOT, FILE)}\n`);
  process.stdout.write(`Rows: ${rowCount}\n`);
  if (changedCount > 0) {
    process.stdout.write(`Runway format changes applied: ${changedCount}\n`);
  } else {
    process.stdout.write(`Runway format changes needed: ${report.formatChanges.length}\n`);
  }
  process.stdout.write(`Other findings: ${report.findings.length}\n`);

  const changesToShow = report.formatChanges.slice(0, 10);
  for (const change of changesToShow) {
    process.stdout.write(`  Row ${change.rowNumber}: RWY ${change.before} -> ${change.after}\n`);
  }
  if (report.formatChanges.length > changesToShow.length) {
    process.stdout.write(`  ... and ${report.formatChanges.length - changesToShow.length} more\n`);
  }

  for (const finding of report.findings.slice(0, 20)) {
    process.stdout.write(`  REVIEW: ${finding}\n`);
  }
  if (report.findings.length > 20) {
    process.stdout.write(`  ... and ${report.findings.length - 20} more findings\n`);
  }

  const unresolved = report.findings.length + report.formatChanges.length;
  process.stdout.write(unresolved === 0 ? 'Result: PASS\n' : 'Result: REVIEW REQUIRED\n');
  if (mode === 'check' && unresolved > 0) process.exitCode = 1;
  if (mode === 'fix' && report.findings.length > 0) process.exitCode = 1;
}

function main() {
  const mode = parseMode(process.argv.slice(2));
  let originalText;
  try {
    originalText = fs.readFileSync(FILE, 'utf8');
  } catch (error) {
    process.stderr.write(`Could not read ${path.relative(ROOT, FILE)}: ${error.message}\n`);
    process.exit(1);
  }

  const hadBom = originalText.charCodeAt(0) === 0xFEFF;
  const jsonText = hadBom ? originalText.slice(1) : originalText;
  let database;
  try {
    database = JSON.parse(jsonText);
  } catch (error) {
    process.stderr.write(`Invalid JSON in ${path.relative(ROOT, FILE)}: ${error.message}\n`);
    process.exit(1);
  }

  let report = inspectDatabase(database);
  let changedCount = 0;
  if (mode === 'fix' && Array.isArray(database?.Sheet1)) {
    for (const row of database.Sheet1) {
      if (!row || typeof row !== 'object' || Array.isArray(row)) continue;
      const normalized = normalizeRunway(row.RWY);
      if (normalized !== null && normalized !== row.RWY) {
        row.RWY = normalized;
        changedCount += 1;
      }
    }
    if (changedCount > 0) writeDatabase(database, jsonText, hadBom);
    report = inspectDatabase(database);
  }

  printReport(Array.isArray(database?.Sheet1) ? database.Sheet1.length : 0, report, mode, changedCount);
}

main();
