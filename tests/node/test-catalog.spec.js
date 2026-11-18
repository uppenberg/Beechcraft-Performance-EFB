const { test, expect } = require('@playwright/test');
const fs = require('node:fs/promises');
const path = require('node:path');
const { openWorkbook } = require('../../tools/test-catalog/workbook');
const { catalogPath, listTests, sync } = require('../../tools/test-catalog/sync');

test('test catalog adds and retires cases without losing Excel edits', {
  annotation: [
    { type: 'catalog-input', description: 'En kopia av Excel-filen, ett tillfälligt testfall, en redigerad beskrivning och ett ändringsförslag.' },
    { type: 'catalog-pass', description: 'Den gamla katalogen underkänns. Fallet läggs till, egna texter överlever en flytt, en oförändrad synkning bevarar filens byte och ett borttaget fall arkiveras med förslaget.' },
    { type: 'catalog-purpose', description: 'Skyddar den redigerbara katalogen mot tappade anteckningar och inaktuella testlistor.' },
  ],
}, async ({}, testInfo) => {
  const file = testInfo.outputPath('catalog.xlsx');
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.copyFile(catalogPath, file);
  const cases = listTests();
  const probe = { id: 'T-CATALOG-PROBE', title: 'Example', input: 'Before', pass: 'OK',
    purpose: 'Example scenario', source: 'fixture.js:1', environment: 'Node' };
  const expanded = [...cases, probe];
  await expect(sync(file, expanded, true)).rejects.toThrow('behöver uppdateras');
  await sync(file, expanded);
  const read = async () => openWorkbook(await fs.readFile(file));
  const find = (sheet, col) => sheet.rows().find(r => sheet.value(r, col) === probe.id);
  const edited = await read();
  const tests = await edited.sheet('Testfall');
  const row = find(tests, 'A');
  expect(tests.value(row, 'C')).toBe('Before');
  tests.set(row, 'C', 'Redigerad indata');
  tests.set(row, 'F', 'Mitt förslag');
  await fs.writeFile(file, await edited.bytes());
  probe.source = 'fixture.js:20';
  await sync(file, expanded);
  const current = await (await read()).sheet('Testfall');
  expect(current.value(find(current, 'A'), 'C')).toBe('Redigerad indata');
  expect(current.value(find(current, 'A'), 'H')).toBe(probe.source);
  const before = await fs.readFile(file);
  await sync(file, expanded);
  expect((await fs.readFile(file)).equals(before)).toBe(true);
  await sync(file, cases);
  const after = await read();
  expect(find(await after.sheet('Testfall'), 'A')).toBeUndefined();
  const history = await after.sheet('Utgångna');
  expect(history.value(find(history, 'B'), 'G')).toBe('Mitt förslag');
});
