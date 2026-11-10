const { execFileSync } = require('node:child_process');
const path = require('node:path');
const assetFiles = require('../asset-files.json');

const root = path.resolve(__dirname, '..');
const sourceFiles = [...new Set([
  'asset-files.json',
  'sw.js',
  ...assetFiles.map((file) => file.slice(2)),
])];
const git = (args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();

try {
  const unstaged = git(['diff', '--name-only', '--', ...sourceFiles]);
  if (unstaged) {
    throw new Error(`Stage all changes to offline app files before committing:\n${unstaged}`);
  }
  for (const file of sourceFiles) {
    try {
      git(['ls-files', '--error-unmatch', '--cached', '--', file]);
    } catch {
      throw new Error(`Offline app file is not staged: ${file}`);
    }
  }

  execFileSync(process.execPath, [path.join(__dirname, 'generate-asset-manifest.js')], {
    cwd: root,
    stdio: 'inherit',
  });
  git(['add', '--', 'asset-manifest.js', 'sw.js']);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
