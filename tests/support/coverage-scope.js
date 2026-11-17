const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const c56xCode = new Set([
  'data/c56x/index.js',
  'data/c56x/core.js',
  'data/c56x/calculations.js',
  'data/c56x/landing-calculations.js',
]);

function includesFile(relative) {
  return (relative.startsWith('js/') && relative.endsWith('.js')) || c56xCode.has(relative);
}

function listFiles() {
  const visit = (directory) => fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? visit(absolute) : [absolute];
  });
  return [...visit(path.join(root, 'js')), ...[...c56xCode].map((file) => path.join(root, file))]
    .filter((file) => includesFile(path.relative(root, file).replaceAll(path.sep, '/')))
    .sort();
}

function relativeUrl(url) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' || parsed.hostname !== '127.0.0.1' ||
        parsed.port !== String(process.env.TEST_PORT || '4173')) return null;
    const relative = decodeURIComponent(parsed.pathname).replace(/^\/+/, '');
    return includesFile(relative) && !relative.split('/').includes('..') ? relative : null;
  } catch {
    return null;
  }
}

module.exports = { root, listFiles, relativeUrl };
