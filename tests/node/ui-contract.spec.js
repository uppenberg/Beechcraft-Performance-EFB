const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');

test('all declared UI action names resolve to registered handlers', () => {
  const root = path.resolve(__dirname, '../..');
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const app = fs.readFileSync(path.join(root, 'js/app.js'), 'utf8');
  const actionMap = app.match(/const uiActions = Object\.freeze\(\{([\s\S]*?)\n\}\);/);
  expect(actionMap, 'the UI action registry remains explicit').not.toBeNull();
  const registered = new Set([...actionMap[1].matchAll(/^\s*([A-Za-z_$][\w$]*):/gm)]
    .map((match) => match[1]));
  const declared = new Set();
  for (const match of html.matchAll(/data-action-(?:click|change|input|keydown|focus)="([^"]+)"/g)) {
    for (const descriptor of match[1].split(';')) {
      const name = descriptor.trim().split(':')[0];
      if (name) declared.add(name);
    }
  }
  expect([...declared].sort()).not.toEqual([]);
  expect([...declared].filter((name) => !registered.has(name)).sort()).toEqual([]);
  expect(html).not.toMatch(/\son(?:click|change|input|keydown|focus)=/i);
});

