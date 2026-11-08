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
      ['tailwind10', 'zeroWind', 'headwind10', 'headwind20', 'headwind30']
        .map(k => r[k] ? r[k].v1 + ' ' + r[k].dist : r[k + '_shaded'].v1 + ' ' + r[k + '_shaded'].dist + '*').join(' | '),
      '|', r.vr, r.v2);
  }
}
