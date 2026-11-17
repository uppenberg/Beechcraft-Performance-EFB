const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '../..');
const read = (file) => fs.readFileSync(path.join(root, file));
const serviceWorkerSource = read('sw.js').toString('utf8');
const assetListMatch = serviceWorkerSource.match(/const ASSETS = (\[[\s\S]*?\]);/);
if (!assetListMatch) throw new Error('The service worker offline asset list is missing.');
const assets = vm.runInNewContext(assetListMatch[1]);

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
  expect(serviceWorkerSource).toContain("importScripts('./version.js')");
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
