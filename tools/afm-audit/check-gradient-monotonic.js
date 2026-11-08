// Plausibility screen for climb-gradient tables (reader JSON or data .js constant).
// Gradient must not decrease with more wind, lower weight or lower temperature (altitude is not monotonic in the AFM). Violations point at OCR misreads (or AFM printing quirks) to verify visually.
const fs = require('fs');
const vm = require('vm');

const [file, constantName] = process.argv.slice(2);
if (!file) {
  console.error('Usage: node tools/afm-audit/check-gradient-monotonic.js FILE.json|FILE.js [CONST]');
  process.exit(2);
}
let table;
if (file.endsWith('.json')) {
  table = JSON.parse(fs.readFileSync(file, 'utf8'));
} else {
  const context = {};
  vm.createContext(context);
  vm.runInContext(`${fs.readFileSync(file, 'utf8')}\nthis.t = ${constantName};`, context);
  table = context.t;
}
const WINDS = [-10, 0, 10, 20, 30];
const val = new Map();
const altitudes = [], weightsSet = new Set(), tempsByAltitude = new Map();
for (const alt of table) {
  altitudes.push(alt.altitudeFt);
  const altitudeTemps = new Set();
  for (const w of alt.weights || alt.data) {
    weightsSet.add(w.weight);
    for (const row of w.data || w.temperatures) {
      altitudeTemps.add(row.temp);
      const winds = row.windKnots || { '-10': row.windMinus10, 0: row.wind0, 10: row.wind10, 20: row.wind20, 30: row.wind30 };
      for (const wind of WINDS) val.set(`${alt.altitudeFt}/${w.weight}/${row.temp}/${wind}`, winds[wind]);
    }
  }
  tempsByAltitude.set(alt.altitudeFt, [...altitudeTemps].sort((a, b) => a - b));
}
const weights = [...weightsSet].sort((a, b) => a - b);
const get = (a, w, t, wi) => val.get(`${a}/${w}/${t}/${wi}`);
let issues = 0;
const report = (msg) => { issues += 1; console.log(msg); };
const EPS = 0.11; // AFM rounding wobbles by 0.1
for (const a of altitudes) for (const w of weights) for (const t of tempsByAltitude.get(a)) for (const wi of WINDS) {
  const v = get(a, w, t, wi);
  if (v === undefined) { report(`${a}/${w}/${t}/${wi}: missing`); continue; }
  const localTemps = tempsByAltitude.get(a);
  const checks = [
    [get(a, w, t, WINDS[WINDS.indexOf(wi) - 1]), v, 'wind'],
    [get(a, weights[weights.indexOf(w) + 1], t, wi), v, 'weight'],
    [v, get(a, w, localTemps[localTemps.indexOf(t) - 1], wi), 'temp'],
  ];
  for (const [lo, hi, kind] of checks) {
    if (lo !== undefined && hi !== undefined && lo > hi + EPS) report(`${a}/${w}/${t}/${wi}: ${kind} order violated (${lo} > ${hi})`);
  }
}
console.log(`${issues} plausibility issues`);
