const fs = require('node:fs');
const path = require('node:path');
const v8toIstanbul = require('v8-to-istanbul');
const { createCoverageMap } = require('istanbul-lib-coverage');
const { createContext } = require('istanbul-lib-report');
const reports = require('istanbul-reports');
const { root, listFiles, relativeUrl } = require('./coverage-scope');

async function convert(file, source, functions) {
  const converter = v8toIstanbul(file, 0, { source });
  await converter.load();
  converter.applyCoverage(functions);
  return converter.toIstanbul();
}

async function createReport() {
  const rawDirectory = path.join(root, 'coverage-raw');
  const reportDirectory = path.join(root, 'coverage-report');
  if (!fs.existsSync(rawDirectory)) throw new Error('No Chromium coverage was collected. Run with EFB_COVERAGE=1.');
  const files = listFiles();
  const sources = new Map(files.map((file) => [file, fs.readFileSync(file, 'utf8')]));
  const map = createCoverageMap({});
  let samples = 0;
  let mismatchedSources = 0;
  let missingPages = 0;
  for (const name of fs.readdirSync(rawDirectory).filter((file) => file.endsWith('.json'))) {
    const entries = JSON.parse(fs.readFileSync(path.join(rawDirectory, name), 'utf8'));
    if (entries?.missingPage === true) {
      missingPages += 1;
      continue;
    }
    if (!Array.isArray(entries)) throw new Error(`Invalid coverage data: ${name}`);
    for (const entry of entries) {
      const relative = relativeUrl(entry.url);
      if (!relative) continue;
      const file = path.join(root, ...relative.split('/'));
      const source = sources.get(file);
      if (source === undefined || entry.source !== source || !Array.isArray(entry.functions)) {
        mismatchedSources += 1;
        continue;
      }
      map.merge(await convert(file, source, entry.functions));
      samples += 1;
    }
  }
  if (!samples) throw new Error('No matching application JavaScript coverage was collected.');

  // Include files never loaded by the browser as zero coverage; otherwise a
  // newly added, untested module could disappear from the denominator.
  for (const [file, source] of sources) {
    if (map.files().includes(file)) continue;
    const empty = [{ functionName: '(empty-report)', ranges: [{ startOffset: 0, endOffset: source.length, count: 0 }], isBlockCoverage: false }];
    map.merge(await convert(file, source, empty));
  }

  fs.mkdirSync(reportDirectory, { recursive: true });
  const context = createContext({ dir: reportDirectory, coverageMap: map, defaultSummarizer: 'nested' });
  for (const format of ['html', 'json', 'json-summary', 'lcovonly', 'text-summary']) {
    reports.create(format).execute(context);
  }

  const testResults = path.join(root, 'test-results', 'results.json');
  let status = 'Testresultatet saknas; kodtäckningen kan vara ofullständig.';
  if (fs.existsSync(testResults)) {
    const results = JSON.parse(fs.readFileSync(testResults, 'utf8'));
    const unexpected = results.stats?.unexpected;
    status = unexpected === 0
      ? `Playwright-rapporten visar ${results.stats.expected} godkända, ${results.stats.skipped} överhoppade och ${results.stats.flaky} instabila testfall utan oväntade fel.`
      : `Playwright-rapporten visar ${unexpected ?? 'ett okänt antal'} oväntade fel; kodtäckningen kan vara ofullständig.`;
  }
  const summary = map.getCoverageSummary().toJSON();
  const table = [['lines', 'Rader'], ['statements', 'Satser'], ['functions', 'Funktioner'], ['branches', 'Grenar']]
    .map(([metric, label]) => `| ${label} | ${summary[metric].covered}/${summary[metric].total} | ${summary[metric].pct}% |`)
    .join('\n');
  const note = `## Kodtäckning för JavaScript (Chromium-sidor)\n\n${status}\n\n` +
    `| Mått | Täckta | Täckning |\n| --- | ---: | ---: |\n${table}\n\n` +
    `Siffrorna gäller de Chromium-tester som valdes när täckningsdata samlades in. ` +
    `Kontrollera att Playwright-rapporten kommer från samma körning, särskilt vid lokal körning. ` +
    `Appmoduler i js/ samt C56X-laddare och beräkningskod ingår; rader i filer som inte laddats räknas som otäckta. ` +
    `Täckningen visar körd kod, inte att resultat eller kontroller är korrekta. WebKit, service worker, ytterligare sidor, ` +
    `inbyggda HTML-skript, CSS, workbook-data och C56X-datatabeller ingår inte. ` +
    `Gren- och funktionsmåtten bygger på V8-data konverterade till Istanbul; helt oladdade filer saknar sådan information och ingår inte i dessa nämnare.\n\n` +
    `Chromium-skriptmätningar: ${samples}. Andra källversioner ignorerade: ${mismatchedSources}. Primära sidor som inte kunnat mätas: ${missingPages}.\n\n` +
    'Ladda ned artefakten code-coverage och öppna index.html för detaljer per fil och rad.\n';
  fs.writeFileSync(path.join(reportDirectory, 'report-status.md'), note);
  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
  const index = path.join(reportDirectory, 'index.html');
  const html = fs.readFileSync(index, 'utf8');
  if (!html.includes('<body>')) throw new Error('Could not add coverage scope information to the HTML report.');
  const banner = `<aside style="padding:12px 16px;background:#e9f3ff;color:#172b4d;font:14px sans-serif;line-height:1.45">` +
    `<strong>Mätningens omfattning:</strong> Primära Chromium-sidor för testerna i denna körning. ` +
    `WebKit, service worker, andra sidor, inbyggda skript, CSS och prestandadata ingår inte. ` +
    `Rader i oladdade filer räknas som otäckta; deras grenar och funktioner räknas inte med. ` +
    `Körd kod är inte ett bevis för korrekta resultat. ${escapeHtml(status)} ` +
    `Primära sidor som inte kunnat mätas: ${missingPages}. Se report-status.md för detaljer.</aside>`;
  fs.writeFileSync(index, html.replace('<body>', `<body>\n${banner}`));
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${note}\n`);
  console.log(`Coverage report: ${path.join(reportDirectory, 'index.html')}`);
  console.log(status);
  if (mismatchedSources) console.warn(`Ignored ${mismatchedSources} script samples that did not match the current source.`);
  if (missingPages) console.warn(`Coverage is incomplete: ${missingPages} primary pages closed before collection.`);
}

if (require.main === module) {
  createReport().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

module.exports = { createReport, convert };
