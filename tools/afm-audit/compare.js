// Jämför en batchfil (samma format som apply.js) mot datafilen utan att ändra något.
//   node tools/afm-audit/compare.js --profile dry-flaps15 batch.txt
// Rapporterar per block: rader som skiljer, rader som bara finns i AFM och rader som bara finns i koden.
const fs = require('fs');
const { parseArgs, loadProfile, loadTables, resolveConst } = require('./lib');

const opts = parseArgs(process.argv.slice(2));
const profile = loadProfile(opts);
const { names, tables } = loadTables(profile.file);
const F = ['v1', 'dist'];
const flat = r => [r.temp, ...['tailwind10', 'zeroWind', 'headwind10', 'headwind20', 'headwind30'].flatMap(k => F.map(f => r[k][f])), r.vr, r.v2];

const blocks = [];
let cur = null;
for (const line of fs.readFileSync(opts._[0], 'utf8').split(/\r?\n/)) {
  if (!line.trim()) continue;
  if (line.includes('|')) {
    const [token, w] = line.split('|');
    cur = { token: token.trim(), name: resolveConst(profile, names, token.trim()), weight: +w, rows: [] };
    blocks.push(cur);
  } else cur.rows.push(line.trim().split(/\s+/).map(Number));
}

const tot = { same: 0, diff: 0, afmOnly: 0, codeOnly: 0, blocksDiffering: 0 };
const COLS = ['temp', 'tV1', 'tD', 'zV1', 'zD', 'h10V1', 'h10D', 'h20V1', 'h20D', 'h30V1', 'h30D', 'vr', 'v2'];
for (const b of blocks) {
  const w = tables[b.name].find(x => x.weight === b.weight);
  if (!w) { console.log(`${b.name}@${b.weight}: vikten saknas i koden`); continue; }
  const code = new Map(w.data.map(r => [r.temp, flat(r)]));
  const out = [];
  for (const r of b.rows) {
    const c = code.get(r[0]);
    if (!c) { tot.afmOnly++; out.push(`  AFM-only temp ${r[0]}`); continue; }
    const d = COLS.map((n, i) => (c[i] !== r[i] ? `${n} kod ${c[i]} / AFM ${r[i]}` : null)).filter(Boolean);
    if (d.length) { tot.diff++; out.push(`  temp ${r[0]}: ${d.join(', ')}`); } else tot.same++;
    code.delete(r[0]);
  }
  for (const t of code.keys()) { tot.codeOnly++; out.push(`  code-only temp ${t}`); }
  if (out.length) { tot.blocksDiffering++; console.log(`${b.token}|${b.weight} (${b.name})\n${out.join('\n')}`); }
}
console.log(tot);
