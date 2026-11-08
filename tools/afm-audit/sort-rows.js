// Sorterar temperaturrader stigande inom varje array. Användning: node sort-rows.js <fil.js>
const fs = require('fs');

const isRow = l => /^\s*\{\s*temp:\s*-?\d+/.test(l);
const temp = l => +l.match(/temp:\s*(-?\d+)/)[1];

function sortRows(text) {
  const eol = text.includes('\r\n') ? '\r\n' : '\n';
  const lines = text.split(eol);
  const out = [];
  let moved = 0;
  for (let i = 0; i < lines.length;) {
    if (!isRow(lines[i])) { out.push(lines[i++]); continue; }
    let j = i;
    while (j < lines.length && isRow(lines[j])) j++;
    const block = lines.slice(i, j);
    const rows = block.map(l => l.replace(/,\s*$/, ''));
    const sorted = rows.map((r, k) => [temp(r), k, r]).sort((a, b) => a[0] - b[0] || a[1] - b[1]).map(x => x[2]);
    const lastHadComma = /,\s*$/.test(block[block.length - 1]);
    sorted.forEach((r, k) => {
      if (r !== rows[k]) moved++;
      out.push(r + (k < sorted.length - 1 || lastHadComma ? ',' : ''));
    });
    i = j;
  }
  return { text: out.join(eol), moved };
}

module.exports = { sortRows };

if (require.main === module) {
  const f = process.argv[2];
  if (!f) { console.error('Användning: node sort-rows.js <fil.js>'); process.exit(1); }
  const r = sortRows(fs.readFileSync(f, 'utf8'));
  fs.writeFileSync(f, r.text);
  console.log('rader flyttade:', r.moved);
}
