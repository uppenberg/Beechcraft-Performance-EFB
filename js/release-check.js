// This small bootstrap also runs when a legacy worker serves new HTML with an
// older cached version.js. Do not expose a mixed-version calculator.
(() => {
  const expected = document.querySelector('meta[name="app-release"]')?.getAttribute('content');
  window.APP_RELEASE_MISMATCH = !expected || String(window.APP_VERSION) !== expected;

  const hostname = window.location.hostname;
  const isLocalDevelopment = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
  if (isLocalDevelopment && 'serviceWorker' in navigator) {
    const reloadKey = 'efb-local-service-worker-cleanup';
    navigator.serviceWorker.getRegistrations().then(async (registrations) => {
      if (!registrations.length) return;
      await Promise.all(registrations.map((registration) => registration.unregister()));
      if (sessionStorage.getItem(reloadKey) !== 'done') {
        sessionStorage.setItem(reloadKey, 'done');
        window.location.reload();
      }
    }).catch((error) => console.warn('Could not remove the local development service worker:', error));
  }

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
