(() => {
  if (window.C56XPerformanceDataReady) return;

  const dataFiles = [
    'core.js',
    'takeoff-gradient-dry.js',
    'takeoff-dry-flaps7.js',
    'takeoff-gradient-wet.js',
    'takeoff-wet-flaps7.js',
    'takeoff-wet-flaps15.js',
    'takeoff-wet-flaps15-no-reverser.js',
    'takeoff-dry-flaps15.js',
    'climb-flightpath-flaps7.js',
    'climb-gradient-flaps7.js',
    'climb-gradient-flaps15-off.js',
    'climb-gradient-flaps15-on.js',
    'gross-climb-gradient-flaps15-off.js',
    'gross-climb-gradient-flaps15-on.js',
    'landing-gross-climb-gradient-flaps35-off.js',
    'landing-gross-climb-gradient-flaps35-on.js',
    'landing-distance-flaps35.js',
    'landing-weight-flaps15-35-off.js',
    'calculations.js',
  ];
  const baseUrl = new URL('./', document.currentScript.src);

  const loadPromise = (async () => {
    for (const file of dataFiles) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = new URL(file, baseUrl);
        script.async = false;
        script.addEventListener('load', resolve, { once: true });
        script.addEventListener('error', () => {
          reject(new Error(`Could not load C56X performance data: ${file}`));
        }, { once: true });
        document.head.appendChild(script);
      });
    }
  })();

  window.C56XPerformanceDataReady = loadPromise;
})();
