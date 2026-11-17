const fs = require('node:fs/promises');

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]);

async function attachAfmReport(testInfo, reference, observations, expectedCount) {
  const report = {
    generatedAt: new Date().toISOString(),
    project: testInfo.project.name,
    test: testInfo.title,
    reviewStatus: reference.reviewStatus,
    source: reference.source,
    conditions: reference.conditions,
    expectedCaseCount: expectedCount,
    completedCaseCount: observations.length,
    observations,
  };
  const json = JSON.stringify(report, null, 2);
  const tableRows = observations.map((row) => {
    const expected = row.reference;
    const cells = [expected.id, `${expected.pdfPage} / ${expected.afmPage}`,
      expected.pressureAltitudeFt, expected.weightLb, expected.oatC, expected.headwindKnots,
      expected.distanceFt, row.actual.distanceFt, row.deltaFt,
      `${expected.vref} / ${expected.vapp}`, `${row.actual.vref} / ${row.actual.vapp}`,
      row.passed ? 'MATCH' : 'MISMATCH'];
    return `<tr>${cells.map((value) => `<td>${escapeHtml(value)}</td>`).join('')}</tr>`;
  }).join('\n');
  const details = observations.map((row) => `<details><summary>${escapeHtml(row.reference.id)}: indata och avlästa värden</summary><pre>${escapeHtml(JSON.stringify(row, null, 2))}</pre></details>`).join('\n');
  const html = `<!doctype html><html lang="sv"><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>AFM-jämförelse</title>
<style>body{font:16px system-ui,sans-serif;margin:24px;color:#17212b}h1{font-size:26px}p{max-width:85ch;line-height:1.5}.table{overflow:auto}table{border-collapse:collapse;font-size:14px}th,td{border:1px solid #bbc4cd;padding:8px;text-align:right;white-space:nowrap}th{background:#eef2f5}details{margin:16px 0}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#f4f6f8;padding:16px}small{overflow-wrap:anywhere}</style>
<h1>AFM-jämförelse: landning C56X</h1>
<p>${escapeHtml(report.test)} · ${escapeHtml(report.project)} · ${escapeHtml(report.generatedAt)}</p>
<p>Slutförda jämförelser: <strong>${observations.length} av ${expectedCount}</strong>. MATCH betyder att avlästa värden motsvarar testreferensen. Kontrollera referensen mot din AFM innan du betraktar den som manuellt verifierad.</p>
<p>Källa: ${escapeHtml(reference.source.file)}, ${escapeHtml(reference.source.document)}, figur ${escapeHtml(reference.source.figure)}. PDF-sidan räknas från 1. Referensstatus: ${escapeHtml(reference.reviewStatus)}.</p>
<p>Sträckan är AFM actual distance i fot, före operativa faktorer. Flaps 35°, banlutning 0 %, VREF vid 50 ft, ställ nere, thrust idle och speedbrakes efter sättning. Positiv vind är motvind, negativ är medvind. Alla AFM-fall ligger på tabellpunkter. Tillåten landningsmassa och andra AFM-tabeller verifieras separat.</p>
<div class="table"><table><thead><tr>${['Fall', 'PDF / AFM-sida', 'PA ft', 'Massa lb', 'OAT °C', 'Vind kt', 'AFM ft', 'App ft', 'Avvikelse ft', 'AFM VREF/VAPP KIAS', 'App VREF/VAPP KIAS', 'Jämförelse'].map((title) => `<th>${escapeHtml(title)}</th>`).join('')}</tr></thead><tbody>${tableRows}</tbody></table></div>
${details}<small>Källfilens SHA-256: ${escapeHtml(reference.source.sha256)}</small></html>`;
  for (const [extension, body, contentType] of [['json', json, 'application/json'], ['html', html, 'text/html']]) {
    const path = testInfo.outputPath(`afm-comparison.${extension}`);
    await fs.writeFile(path, body, 'utf8');
    await testInfo.attach(`AFM comparison (${extension})`, { path, contentType });
  }
}

module.exports = { attachAfmReport };
