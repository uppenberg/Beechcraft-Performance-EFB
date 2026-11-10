const { execFileSync } = require('node:child_process');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const git = (args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();

try {
  git(['rev-parse', '--show-toplevel']);
} catch {
  console.log('Git hooks were not installed because this is not a Git checkout.');
  process.exit(0);
}

let current = '';
try {
  current = git(['config', '--local', '--get', 'core.hooksPath']);
} catch {
  // No hook path has been configured for this checkout yet.
}

if (current && current !== '.githooks') {
  console.warn(`Existing Git hook path (${current}) was preserved. The offline manifest check still runs in CI.`);
} else if (!current) {
  git(['config', '--local', 'core.hooksPath', '.githooks']);
  console.log('Git hooks installed: offline assets will be prepared before each commit.');
}
