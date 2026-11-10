const fs = require('node:fs');
const path = require('node:path');

module.exports = async () => {
  if (process.env.EFB_COVERAGE !== '1') return;
  const root = path.resolve(__dirname, '../..');
  for (const name of ['coverage-raw', 'coverage-report']) {
    fs.rmSync(path.join(root, name), { recursive: true, force: true });
  }
};
