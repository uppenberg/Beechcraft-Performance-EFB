// Compare a climb-gradient data file with a JSON table extracted from the AFM.
// The extraction is only a screening aid; any OCR output must be verified visually.
const fs = require('fs');
const vm = require('vm');

const [file, constantName, referenceFile] = process.argv.slice(2);
if (!file || !constantName || !referenceFile) {
  console.error('Usage: node tools/afm-audit/compare-gradient.js FILE.js CONST reference.json');
  process.exit(2);
}
if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(constantName)) {
  throw new Error(`Invalid constant name: ${constantName}`);
}

const context = {};
vm.createContext(context);
const source = fs.readFileSync(file, 'utf8');
vm.runInContext(
  `${source}\nthis[${JSON.stringify(constantName)}] = ${constantName};`,
  context,
  { filename: file }
);
const actual = context[constantName];
if (!Array.isArray(actual)) throw new Error(`Constant ${constantName} is not an array`);
const reference = JSON.parse(fs.readFileSync(referenceFile, 'utf8'));

function normalize(altitudeTable) {
  const weights = altitudeTable.weights || altitudeTable.data || [];
  return weights.map((weightTable) => {
    const rows = weightTable.data || weightTable.temperatures || [];
    return {
      weight: weightTable.weight,
      rows: rows.map((row) => {
        const winds = row.windKnots || {
          '-10': row.windMinus10, '0': row.wind0, '10': row.wind10,
          '20': row.wind20, '30': row.wind30,
        };
        return { temp: row.temp, winds };
      }),
    };
  });
}

const key = (altitude, weight, temp, wind) => `${altitude}/${weight}/${temp}/${wind}`;
const values = new Map();
for (const altitudeTable of actual) {
  for (const weightTable of normalize(altitudeTable)) {
    for (const row of weightTable.rows) {
      for (const wind of [-10, 0, 10, 20, 30]) {
        values.set(
          key(altitudeTable.altitudeFt, weightTable.weight, row.temp, wind),
          row.winds[String(wind)]
        );
      }
    }
  }
}

const differences = [];
for (const altitudeTable of reference) {
  for (const weightTable of altitudeTable.weights || []) {
    for (const row of weightTable.data || []) {
      for (const wind of [-10, 0, 10, 20, 30]) {
        const cell = key(altitudeTable.altitudeFt, weightTable.weight, row.temp, wind);
        const actualValue = values.get(cell);
        const expectedValue = row.windKnots?.[String(wind)];
        if (actualValue !== expectedValue) {
          differences.push(`${cell}: code=${actualValue ?? 'missing'}, AFM=${expectedValue ?? 'missing'}`);
        }
      }
    }
  }
}

console.log(`Compared ${reference.length} altitudes; ${differences.length} differences`);
if (differences.length) {
  console.log(differences.join('\n'));
  process.exitCode = 1;
}
