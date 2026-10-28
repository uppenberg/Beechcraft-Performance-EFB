// Byter hela tabellblock i en datafil och kontrollerar resultatet. Användning:
//   node apply.js --profile dry-flaps7 batch.txt
//   node apply.js --file data/c56x/takeoff-wet-flaps7.js batch.txt   (rubriker måste då vara konstnamn)
//
// Batchfil: rubrikrad  <tabell>|<vikt>  där <tabell> är konstnamn, [tagg:]höjd eller unik delsträng,
// följd av en rad per temperatur med 13 fält:
//   temp tailV1 tailDist zeroV1 zeroDist h10V1 h10Dist h20V1 h20Dist h30V1 h30Dist vr v2
const fs = require('fs');
const path = require('path');
const { parseArgs, loadProfile, loadTables, resolveConst } = require('./lib');
const { sortRows } = require('./sort-rows');

const opts = parseArgs(process.argv.slice(2));
const profile = loadProfile(opts);
const batchFile = opts._[0];
if (!batchFile) throw new Error('Ange en batchfil');

const before = loadTables(profile.file);
const batch = [];
let cur = null;
for (const line of fs.readFileSync(batchFile, 'utf8').split(/\r?\n/)) {
  if (!line.trim()) continue;
  if (line.includes('|')) {
    const [token, w] = line.split('|');
    cur = { name: resolveConst(profile, before.names, token.trim()), weight: +w, rows: [] };
    batch.push(cur);
  } else {
    const p = line.trim().split(/\s+/);
    if (p.length !== 13 || p.some(x => !/^-?\d+$/.test(x))) throw new Error('Ogiltig rad (13 heltal krävs): ' + line);
    cur.rows.push(p.map(Number));
  }
}

let s = before.src;
const eol = s.includes('\r\n') ? '\r\n' : '\n';
const snapshot = path.join(profile.work, 'pre_apply.js');
fs.writeFileSync(snapshot, s);

for (const { name, weight, rows } of batch) {
  const decls = [...s.matchAll(/^\s*(?:export\s+)?const\s+(\w+)\s*=\s*\[/gm)].map(m => ({ name: m[1], index: m.index }));
  const iDecl = decls.findIndex(d => d.name === name);
  if (iDecl < 0) throw new Error(`Hittar inte konstanten ${name}`);
  const c0 = decls[iDecl].index;
  const end = iDecl + 1 < decls.length ? decls[iDecl + 1].index : s.length;
  const w0 = s.slice(0, end).indexOf(`weight: ${weight},`, c0);
  if (w0 < 0) throw new Error(`Hittar inte ${name} vikt ${weight}`);
  const open = s.indexOf('[', s.indexOf('data:', w0));
  let depth = 0, close = -1;
  for (let i = open; i < end; i++) {
    if (s[i] === '[') depth++;
    else if (s[i] === ']' && --depth === 0) { close = i; break; }
  }
  if (close < 0) throw new Error('Hittar inte slutet på data-arrayen för ' + name);

  const old = s.slice(open, close);
  const rowIndent = (old.match(/^([ \t]*)\{ temp:/m) || [, ' '.repeat(12)])[1];
  const padTemp = /temp: \d,\s{2,}/.test(old);
  const closeIndent = s.slice(s.lastIndexOf('\n', close) + 1, close);
  const c = (v1, d) => `{ v1: ${v1}, dist: ${d} }`;
  const body = rows.map(v => {
    const t = padTemp ? (v[0] + ',').padEnd(5) : v[0] + ', ';
    return `${rowIndent}{ temp: ${t}tailwind10: ${c(v[1], v[2])}, zeroWind: ${c(v[3], v[4])}, headwind10: ${c(v[5], v[6])}, headwind20: ${c(v[7], v[8])}, headwind30: ${c(v[9], v[10])}, vr: ${v[11]}, v2: ${v[12]} }`;
  }).join(',' + eol);
  s = s.slice(0, open) + '[' + eol + body + eol + closeIndent + s.slice(close);
}

const sorted = sortRows(s);
fs.writeFileSync(profile.file, sorted.text);

try { loadTables(profile.file); console.log('SYNTAX_OK'); }
catch (e) { fs.writeFileSync(profile.file, fs.readFileSync(snapshot, 'utf8')); throw new Error('Syntaxfel, återställd: ' + e.message); }

const strip = t => t.replace(/\r/g, '');
const a = strip(fs.readFileSync(snapshot, 'utf8')).split('\n'), b = strip(sorted.text).split('\n');
const changed = new Set(a), changedB = new Set(b);
console.log('rader som skiljer:', a.filter(l => !changedB.has(l)).length + b.filter(l => !changed.has(l)).length);
const bad = sorted.text.split('\n').filter(l => eol === '\r\n' && !l.endsWith('\r')).length - (sorted.text.endsWith('\n') ? 1 : 0);
console.log('rader utan CRLF (ska vara 0):', eol === '\r\n' ? Math.max(0, bad) : 'n/a (LF-fil)');
