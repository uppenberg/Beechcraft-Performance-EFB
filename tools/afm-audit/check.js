// Rimlighetskontroll av avlästa rader (batchfil eller datafil) för att hitta felavläsningar.
//   node tools/afm-audit/check.js batch.txt          (13 heltal per rad, rubrik <tabell>|<vikt>)
// Flaggar: avstånd som inte minskar med ökad motvind (tail > zero > h10 > h20 > h30), V1 utanför 70-110,
// avstånd som inte slutar på 0, VR < V1 och dubbla/felordnade temperaturer.
// Avstånd som minskar med temperaturen vid viktövergångar kan vara äkta AFM-data (V1-begränsning) – granska visuellt.
const fs = require('fs');

let tag = '';
const warn = (m) => console.log(`${tag}: ${m}`);
let prev = null;
for (const line of fs.readFileSync(process.argv[2], 'utf8').split(/\r?\n/)) {
  if (!line.trim()) continue;
  if (line.includes('|')) { tag = line.trim(); prev = null; continue; }
  const r = line.trim().split(/\s+/).map(Number);
  if (r.length !== 13 || r.some(Number.isNaN)) { warn(`ogiltig rad: ${line}`); continue; }
  const [t, v1a, da, v1b, db, v1c, dc, v1d, dd, v1e, de, vr, v2] = r;
  if (!(da > db && db >= dc && dc >= dd && dd >= de)) warn(`temp ${t}: avstånd ej fallande med motvind`);
  if ([v1a, v1b, v1c, v1d, v1e].some(v => v < 70 || v > 110)) warn(`temp ${t}: V1 utanför 70-110 (skuggad cell?)`);
  if ([da, db, dc, dd, de].some(d => d % 10)) warn(`temp ${t}: avstånd slutar inte på 0`);
  if (vr < v1e || v2 < vr) warn(`temp ${t}: VR/V2 orimliga`);
  if (prev !== null && t <= prev) warn(`temp ${t}: dubblett eller fel ordning`);
  prev = t;
}
