// Jämför OCR-TSV (från tesseract) mot koden. Endast för screening – verifiera alltid visuellt mot PDF.
// Användning: node analyze.js --profile dry-flaps7 [--crops /tmp/afm-crops]
// Crop-filer heter <tagg>-<höjd>-<vikt>.tsv. Resultat skrivs till <work>/analysis.txt.
const fs = require('fs');
const path = require('path');
const { parseArgs, loadProfile, loadTables, resolveConst } = require('./lib');

const opts = parseArgs(process.argv.slice(2));
const profile = loadProfile(opts);
const { names, tables } = loadTables(profile.file);
const out = [];

for (const f of fs.readdirSync(profile.crops).filter(x => x.endsWith('.tsv')).sort()) {
  const m = f.match(/^(\w+)-(\d+)-(\d+)\.tsv$/);
  if (!m) continue;
  const [, tag, alt, w] = m;
  const spec = profile.tags[tag];
  if (!spec || !spec.cols) { out.push(`${f}: ingen kolumnprofil för taggen ${tag}`); continue; }
  const name = resolveConst(profile, names, `${tag}:${alt}`);
  const tb = tables[name].find(x => x.weight === +w);
  if (!tb) { out.push(`${f}: vikt ${w} saknas i ${name}`); continue; }

  const words = fs.readFileSync(path.join(profile.crops, f), 'utf8').split(/\r?\n/).slice(1)
    .map(l => l.split('\t')).filter(p => p.length >= 12 && /^-?\d+$/.test(p[11].trim()))
    .map(p => ({ x: +p[6] + +p[8] / 2, y: +p[7] + +p[9] / 2, v: +p[11] }))
    .filter(p => p.y >= (spec.yMin ?? 0) && p.y <= (spec.yMax ?? 1e9)).sort((a, b) => a.y - b.y);
  const lines = [];
  for (const wd of words) {
    const l = lines[lines.length - 1];
    if (l && wd.y - l.y <= 9) l.w.push(wd); else lines.push({ y: wd.y, w: [wd] });
  }
  let diffs = 0, rows = 0;
  const detail = [];
  for (const l of lines) {
    const cells = Array(13).fill(null);
    for (const wd of l.w) {
      let k = 0;
      spec.cols.forEach((c, i) => { if (Math.abs(c - wd.x) < Math.abs(spec.cols[k] - wd.x)) k = i; });
      if (Math.abs(spec.cols[k] - wd.x) < 40) cells[k] = wd.v;
    }
    if (cells[0] === null || cells.filter(v => v !== null).length < 8) continue;
    const r = tb.data.find(x => x.temp === cells[0]);
    if (!r) { detail.push(`  temp ${cells[0]} saknas i koden`); diffs++; continue; }
    rows++;
    const code = [r.temp, r.tailwind10.v1, r.tailwind10.dist, r.zeroWind.v1, r.zeroWind.dist, r.headwind10.v1, r.headwind10.dist,
      r.headwind20.v1, r.headwind20.dist, r.headwind30.v1, r.headwind30.dist, r.vr, r.v2];
    cells.forEach((v, i) => { if (v !== null && v !== code[i]) { diffs++; detail.push(`  temp ${r.temp} kol ${i}: OCR ${v} kod ${code[i]}`); } });
  }
  out.push(`${f} (${name}): ${rows} rader, ${diffs} avvikelser`, ...detail);
}
const file = path.join(profile.work, 'analysis.txt');
fs.writeFileSync(file, out.join('\n') + '\n');
console.log(out.filter(l => !l.startsWith('  ')).join('\n'));
console.log('detaljer:', file);
