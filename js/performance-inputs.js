// The same form snapshot is passed to either performance engine. Keeping raw
// input strings preserves the difference between an empty field and zero.
/** @param {Document} root */
export function readPerformanceInputs(root) {
  /** @param {string} id */
  const read = (id) => {
    const control = /** @type {HTMLInputElement | HTMLSelectElement | null} */ (root.getElementById(id));
    return control?.value ?? '';
  };
  /** @param {'to' | 'ldg'} prefix */
  const phase = (prefix) => ({
    mass: read(`${prefix}-mass`),
    rwcc: read(`${prefix}-rwcc`),
    flaps: read(`${prefix}-flaps`),
    antiIce: read(`${prefix}-anti-ice`),
    reversers: read(`${prefix}-reversers`),
    windDir: read(`${prefix}-wind-dir`),
    windSpeed: read(`${prefix}-wind-spd`),
    oat: read(`${prefix}-oat`),
    qnh: read(`${prefix}-qnh`),
  });
  return {
    registration: read('global-registration'),
    takeoff: { ...phase('to'), technique: read('to-technique'), deice: read('to-deice') },
    landing: phase('ldg'),
  };
}
