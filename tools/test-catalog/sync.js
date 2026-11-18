const fs = require('node:fs/promises');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { createHash, randomUUID } = require('node:crypto');
const { openWorkbook } = require('./workbook');
const controls = require('./controls.json');
const engineReference = require('../../tests/references/engine-regression.json');

const root = path.resolve(__dirname, '../..');
const catalogPath = path.join(root, 'outputs/testkatalog-20261118/Testkatalog-EFB.xlsx');
const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function discover(config) {
  const env = { ...process.env, EFB_RUN_WEBKIT: '1' };
  // Discovery must print to stdout even if the normal CI reporter writes to disk.
  for (const key of ['PLAYWRIGHT_JSON_OUTPUT_FILE', 'PLAYWRIGHT_JSON_OUTPUT_DIR', 'PLAYWRIGHT_JSON_OUTPUT_NAME']) delete env[key];
  const stdout = execFileSync(process.execPath, [require.resolve('@playwright/test/cli'), 'test',
    '--list', '--pass-with-no-tests', '--reporter=json', '--config=' + config],
  { cwd: root, env, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  const report = JSON.parse(stdout);
  if (report.errors?.length) throw Error(JSON.stringify(report.errors));
  const cases = [];
  function visit(suite, parents) {
    for (const spec of suite.specs || []) {
      const title = [...parents, spec.title].join(' › ');
      const file = path.relative(root, path.resolve(report.config.rootDir, spec.file)).split(path.sep).join('/');
      const annotations = Object.fromEntries(spec.tests.flatMap(t => t.annotations || []).map(a => [a.type, a.description]));
      const projects = new Set(spec.tests.map(t => t.projectName));
      const skipped = spec.tests.every(t => t.expectedStatus === 'skipped');
      let environment = [...projects].filter(p => !(file === 'tests/pwa.spec.js' && p === 'ipad-mini'))
        .map(p => ({ chromium: 'Chromium', 'ipad-mini': 'WebKit · iPad mini', node: 'Node' })[p] || p).sort().join(' + ');
      environment = environment.replace('Chromium + WebKit · iPad mini', 'Chromium + WebKit');
      if (skipped) environment += ' (hoppas över)';
      const id = annotations['catalog-id'] ?? 'T-' + createHash('sha256').update(file + '|' + title).digest('hex').slice(0, 8).toUpperCase();
      if (!/^T-[A-Z0-9_-]+$/i.test(id)) throw Error('Ogiltigt test-ID: ' + id);
      cases.push({ id, title, input: annotations['catalog-input'], pass: annotations['catalog-pass'],
        purpose: annotations['catalog-purpose'], model: annotations['catalog-engine'], environment, source: file + ':' + spec.line });
    }
    for (const nested of suite.suites || []) visit(nested, [...parents, nested.title]);
  }
  for (const suite of report.suites) visit(suite, []);
  return cases;
}

function unique(items, key, context) {
  const map = new Map();
  for (const item of items) {
    const id = key(item);
    if (!id || map.has(id)) throw Error(context + ': saknat eller dubblerat ID ' + id);
    map.set(id, item);
  }
  return map;
}

const listTests = () => [...discover('playwright.config.js'), ...discover('playwright.node.config.js')];

async function sync(file = catalogPath, cases = listTests(), checkOnly = false) {
  const original = await fs.readFile(file);
  const book = await openWorkbook(original);
  const incomplete = [];
  let archive;
  async function retire(sheet, row, name) {
    if (!archive) {
      archive = await book.sheet('Utgångna', true);
      if (!archive.rows().length) {
        const header = archive.append();
        ['Från blad', 'Test-ID', 'Test eller kontroll', 'Indata eller referensfält', 'Villkor eller värde',
          'Syfte eller enhet', 'Ändringsförslag', 'Körmiljö', 'Källa'].forEach((v, i) => archive.set(header, alpha[i], v));
      }
    }
    const copy = archive.append();
    archive.set(copy, 'A', name);
    for (const col of 'ABCDEFGH') archive.set(copy, alpha[alpha.indexOf(col) + 1], sheet.value(row, col));
    sheet.remove(row);
  }

  async function reconcile(name, desired, rowKey, itemKey, update) {
    const sheet = await book.sheet(name);
    const wanted = unique(desired, itemKey, name);
    const data = sheet.rows().slice(1);
    const managed = data.filter(r => !/^NY-/i.test(sheet.value(r, 'A')) && sheet.value(r, 'A'));
    const existing = unique(managed, r => rowKey(sheet, r), name);
    let resized = false;
    for (const [id, item] of wanted) {
      const previous = existing.get(id);
      const row = previous || sheet.append(data[0]);
      if (!previous) resized = true;
      update(sheet, row, item);
    }
    for (const [id, row] of existing) {
      if (wanted.has(id)) continue;
      await retire(sheet, row, name);
      resized = true;
    }
    if (resized) await sheet.resizeTable();
  }

  function setCase(sheet, row, item) {
    for (const [col, key] of [['A', 'id'], ['B', 'title'], ['G', 'environment'], ['H', 'source']]) sheet.set(row, col, item[key]);
    // Seed descriptions for new rows, leaving subsequent Excel edits in place.
    for (const [col, key] of [['C', 'input'], ['D', 'pass'], ['E', 'purpose']]) {
      if (!sheet.value(row, col).trim() && item[key]) sheet.set(row, col, item[key]);
      if (!sheet.value(row, col).trim()) incomplete.push(item.id + ' (' + key + ')');
    }
  }
  const sheetId = (s, r) => s.value(r, 'A');
  await reconcile('Testfall', cases, sheetId, c => c.id, setCase);
  for (const control of controls) await fs.access(path.join(root, control.source.replace(/:\d+$/, '')));
  await reconcile('Övriga kontroller', controls, sheetId, c => c.id, setCase);

  const refs = [];
  for (const c of cases.filter(c => c.model)) {
    const values = engineReference[c.model];
    if (!values || typeof values !== 'object') throw Error('Saknar motorreferens för ' + c.model);
    for (const [field, value] of Object.entries(values)) {
      if (!Number.isFinite(value)) throw Error('Ogiltig motorreferens: ' + field);
      const unit = /^(v1|vr|v2|vref|vapp)/i.test(field) ? 'kt' : /climb/i.test(field) ? '%' : c.model === 'C56X' ? 'ft' : 'm';
      refs.push({ id: c.id, model: c.model, field, value, unit });
    }
  }
  await reconcile('Motorreferenser', refs, (s, r) => s.value(r, 'A') + '/' + s.value(r, 'C'), e => e.id + '/' + e.field,
    (s, r, e) => [e.id, e.model, e.field, e.value, e.unit].forEach((v, i) => s.set(r, alpha[i], v)));
  const guide = await book.sheet('Läsanvisning');
  const notes = {
    'Arbetskopia': 'Inventering av arbetskopian vid senaste synkning. Fil och rad avser testdeklarationen. npm run catalog:update läser den aktuella testlistan.',
    'Vad som räknas': cases.length + ' upptäckta testfall, varav ' + cases.filter(c => c.environment.startsWith('Node')).length +
      ' i Node. Ett test i flera webbläsare listas en gång. Matrisvärden inom samma test beskrivs i dess scenario.',
    'Referensvärden': refs.length + ' numeriska utdata från tests/references/engine-regression.json, referenscommit ' + engineReference.sourceCommit +
      '. Absolut tolerans är mindre än 0,0000005 i fältets enhet. Referenserna beskriver mjukvarans beteende i dessa fall.',
  };
  for (const r of guide.rows()) if (Object.hasOwn(notes, guide.value(r, 'A'))) guide.set(r, 'B', notes[guide.value(r, 'A')]);
  const changed = book.changed.size > 0;
  console.log(cases.length + ' testfall, ' + controls.length + ' övriga kontroller, ' + refs.length + ' referensvärden.');
  if (changed && !checkOnly) {
    const temp = file + '.' + randomUUID() + '.tmp';
    try {
      await fs.writeFile(temp, await book.bytes(), { flag: 'wx' });
      if (!(await fs.readFile(file)).equals(original)) throw Error('Excel-filen ändrades under synkningen. Kör igen.');
      await fs.rename(temp, file);
    } finally { await fs.rm(temp, { force: true }); }
    console.log('Uppdaterade ' + file);
  }
  if (incomplete.length) console.warn('Komplettera indata, godkäntvillkor eller syfte: ' + incomplete.join(', '));
  if (checkOnly && (changed || incomplete.length)) throw Error('Testkatalogen behöver uppdateras. Kör npm run catalog:update och spara katalogen med teständringen.');
  if (!changed) console.log('Excel-filen är aktuell.');
}
if (require.main === module) {
  Promise.resolve().then(() => sync(catalogPath, listTests(), process.argv.includes('--check')))
    .catch(error => { console.error(error.message); process.exitCode = 1; });
}
module.exports = { catalogPath, listTests, sync };
