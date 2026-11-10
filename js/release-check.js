// This small bootstrap also runs when a legacy worker serves new HTML with an
// older cached version.js. Do not expose a mixed-version calculator.
(() => {
  const expected = document.querySelector('meta[name="app-release"]')?.getAttribute('content');
  window.APP_RELEASE_MISMATCH = !expected || String(window.APP_VERSION) !== expected;
  if (!window.APP_RELEASE_MISMATCH) return;
  document.addEventListener('DOMContentLoaded', () => {
    const status = document.getElementById('initialization-status');
    if (status) status.textContent = 'App update required. Open Settings and install the available update.';
    const main = document.querySelector('main');
    if (main) main.hidden = true;
    const registration = document.getElementById('global-registration');
    if (registration) registration.disabled = true;
  });
})();
