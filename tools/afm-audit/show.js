// Visar tabeller ur datafilen. Användning:
//   node show.js --profile dry-flaps7 3000-14500 on:2000-16000 NAMN@16000
// Spec: [tagg:]höjd-vikt  eller  konstnamn(-del)@vikt
const { parseArgs, loadProfile, loadTables, resolveConst } = require('./lib');

const opts = parseArgs(process.argv.slice(2));
const profile = loadProfile(opts);
const { names, tables } = loadTables(profile.file);

for (const spec of opts._) {
  const at = spec.lastIndexOf('@');
  const sep = at >= 0 ? at : spec.lastIndexOf('-');
  const token = spec.slice(0, sep);
  const weight = +spec.slice(sep + 1);
  const name = resolveConst(profile, names, token);
  const tb = tables[name].find(x => x.weight === weight);
  if (!tb) throw new Error(`Vikt ${weight} saknas i ${name} (finns: ${tables[name].map(x => x.weight).join(', ')})`);
  console.log('##', token, weight, name);
  for (const r of tb.data) {
    console.log(String(r.temp).padStart(3),
      [r.tailwind10, r.zeroWind, r.headwind10, r.headwind20, r.headwind30].map(q => q.v1 + ' ' + q.dist).join(' | '),
      '|', r.vr, r.v2);
  }
}
