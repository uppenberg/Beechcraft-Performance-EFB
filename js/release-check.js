// This small bootstrap also runs when a legacy worker serves new HTML with an
// older cached version.js. Do not expose a mixed-version calculator.
(() => {
  const hostname = window.location.hostname;
  const isLocalDevelopment = (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]') &&
    window.location.port === '5500';
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

})();
