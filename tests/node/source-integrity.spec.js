const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '../..');
const read = (file) => fs.readFileSync(path.join(root, file));
// With an empty cache the worker's public readiness check lists every required asset.
async function requiredOfflineAssets() {
  const listeners = new Map();
  const scope = 'https://efb.example/';
  const worker = vm.createContext({
    URL,
    self: { registration: { scope }, addEventListener: (name, handler) => listeners.set(name, handler) },
    caches: { open: async () => ({ match: async () => undefined }) },
    importScripts: (file) => vm.runInContext(read(new URL(file, scope).pathname.slice(1)).toString(), worker),
  });
  vm.runInContext(read('sw.js').toString(), worker);
  let reply;
  let pending;
  listeners.get('message')({
    data: { type: 'CHECK_OFFLINE_DATA' },
    ports: [{ postMessage: (result) => { reply = result; } }],
    waitUntil: (promise) => { pending = promise; },
  });
  await pending;
  expect(reply.error).toBeUndefined();
  expect(reply.ready).toBe(false);
  expect(reply.missing.length).toBeGreaterThan(0);
  expect(reply.missing).toHaveLength(reply.total);
  return reply.missing;
}

test('offline asset checkout attributes preserve identical bytes across platforms', async () => {
  const assets = await requiredOfflineAssets();
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

test('app modules and their imports are included in the offline asset list', async () => {
  const assets = await requiredOfflineAssets();
  const included = new Set(assets.map((asset) => asset.replace(/^\.\//, '')));
  for (const file of included) expect(fs.existsSync(path.join(root, file)), file).toBe(true);
  const modules = fs.readdirSync(path.join(root, 'js')).filter((name) => name.endsWith('.js'));
  for (const name of modules) {
    expect(included.has(`js/${name}`), name).toBe(true);
    const source = read(`js/${name}`).toString('utf8');
    for (const { fileName } of ts.preProcessFile(source).importedFiles) {
      if (!fileName.startsWith('.')) continue;
      const imported = path.posix.join('js', fileName);
      expect(included.has(imported), `${name} imports ${imported}`).toBe(true);
    }
  }
});
