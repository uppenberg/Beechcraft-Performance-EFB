const { test, expect } = require('./support/coverage-test');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');
const baseline = require('./references/app-update-regression.json');
const recordedChanges = require('./references/source-hash-changes.json');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file));
const readAssetList = () => fs.readFileSync(path.join(root, 'asset-files.js'), 'utf8');
const sha256 = (content) => crypto.createHash('sha256').update(content).digest('hex');
const assetListContext = { self: {} };
vm.runInNewContext(readAssetList(), assetListContext);
const assets = assetListContext.self.EFB_OFFLINE_ASSETS;

function matchesHistoricalHash(file, bytes, expected) {
  if (sha256(bytes) === expected) return true;
  // Historical fixtures were recorded on Windows before release assets had
  // fixed LF line endings. Preserve their provenance without changing data.
  if (!/\.(?:js|json)$/.test(file)) return false;
  const lf = bytes.toString('utf8').replace(/\r\n/g, '\n');
  return sha256(Buffer.from(lf, 'utf8')) === expected ||
    sha256(Buffer.from(lf.replace(/\n/g, '\r\n'), 'utf8')) === expected;
}

test('performance data hashes match the baseline or an explicitly recorded change', () => {
  for (const [file, baselineHash] of Object.entries(baseline.sourceHashesSha256)) {
    const bytes = read(file);
    const actual = sha256(bytes);
    const change = recordedChanges.changes[file];
    if (change) {
      expect(change.baseline, file).toBe(baselineHash);
      expect(actual, file).toBe(change.current);
    } else {
      expect(matchesHistoricalHash(file, bytes, baselineHash), file).toBe(true);
    }
  }
});

test('offline asset checkout attributes preserve identical bytes across platforms', () => {
  const files = assets.map((asset) => asset.replace(/^\.\//, ''));
  const output = execFileSync('git', ['check-attr', 'text', 'eol', '--', ...files], {
    cwd: root, encoding: 'utf8',
  });
  const attributes = new Map();
  for (const line of output.trim().split(/\r?\n/)) {
    const match = line.match(/^(.*): (text|eol): (.*)$/);
    expect(match, line).not.toBeNull();
    const [, file, key, value] = match;
    if (!attributes.has(file)) attributes.set(file, {});
    attributes.get(file)[key] = value;
  }
  for (const file of files) {
    const attr = attributes.get(file);
    expect(attr, file).toBeDefined();
    if (file.startsWith('data/c56x/') || /\.(?:xlsx|png)$/.test(file)) {
      expect(attr.text, file).toBe('unset');
    } else {
      expect(attr, file).toEqual({ text: 'set', eol: 'lf' });
      expect(read(file).includes(Buffer.from('\r\n')), file).toBe(false);
    }
  }
});

test('all app module imports and C56X loader files are included in the offline asset list', () => {
  const included = new Set(assets.map((asset) => asset.replace(/^\.\//, '')));
  for (const file of included) expect(fs.existsSync(path.join(root, file)), file).toBe(true);
  expect(read('sw.js').toString('utf8')).toContain("importScripts('./version.js', './asset-files.js')");
  const modules = fs.readdirSync(path.join(root, 'js')).filter((name) => name.endsWith('.js'));
  for (const name of modules) {
    expect(included.has(`js/${name}`), name).toBe(true);
    const source = read(`js/${name}`).toString('utf8');
    for (const match of source.matchAll(/\bfrom\s+['"](\.\/[^'"]+)['"]/g)) {
      const imported = path.posix.normalize(path.posix.join('js', match[1]));
      expect(included.has(imported), `${name} imports ${imported}`).toBe(true);
    }
  }
  const loader = read('data/c56x/index.js').toString('utf8');
  const files = loader.match(/const dataFiles = \[([\s\S]*?)\];/);
  expect(files, 'C56X loader file list').not.toBeNull();
  for (const match of files[1].matchAll(/['"]([^'"]+\.js)['"]/g)) {
    expect(included.has(`data/c56x/${match[1]}`), match[1]).toBe(true);
  }
});
