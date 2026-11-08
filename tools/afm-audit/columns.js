// Skriver ut x-centra för numeriska OCR-ord i en tesseract-TSV, för att kalibrera "cols" i en profil.
// Användning: node columns.js crop.tsv [--gap 25]
const fs = require('fs');
const { parseArgs } = require('./lib');

const opts = parseArgs(process.argv.slice(2));
const gap = +(opts.gap || 25);
const xs = [];
for (const l of fs.readFileSync(opts._[0], 'utf8').split(/\r?\n/).slice(1)) {
  const f = l.split('\t');
  if (f.length < 12 || !/^-?\d+$/.test((f[11] || '').trim())) continue;
  xs.push(+f[6] + +f[8] / 2);
}
xs.sort((a, b) => a - b);
const groups = [];
for (const x of xs) {
  const g = groups[groups.length - 1];
  if (g && x - g[g.length - 1] <= gap) g.push(x); else groups.push([x]);
}
console.log(JSON.stringify(groups.filter(g => g.length > 3).map(g => Math.round(g.reduce((a, b) => a + b) / g.length))));
