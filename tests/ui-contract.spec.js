const { test, expect } = require('./support/coverage-test');
const { blockExternalRequests, openApp, setServerMode } = require('./support/app-helpers');

test.use({ serviceWorkers: 'block' });

test('all declared UI action names resolve to registered handlers', async ({ page, context, request }) => {
  await setServerMode(request, 'normal');
  await blockExternalRequests(context);
  await openApp(page);
  const bindings = await page.evaluate(async () => {
    const { uiActions } = await import('/js/app.js');
    const declared = new Set();
    for (const element of document.querySelectorAll('*')) {
      for (const attribute of element.attributes) {
        if (!attribute.name.startsWith('data-action-')) continue;
        for (const descriptor of attribute.value.split(';')) {
          const name = descriptor.trim().split(':')[0];
          if (name) declared.add(name);
        }
      }
    }
    return {
      count: declared.size,
      unresolved: [...declared].filter(name => !Object.hasOwn(uiActions, name) || typeof uiActions[name] !== 'function'),
    };
  });
  expect(bindings.count).toBeGreaterThan(0);
  expect(bindings.unresolved).toEqual([]);
});
