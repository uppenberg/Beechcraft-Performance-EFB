/** @param {string} value */
export function isValidWindDirection(value) {
  const degrees = Number(value);
  return value.trim() !== '' && Number.isFinite(degrees) && degrees >= 0 && degrees <= 360;
}

/** @param {{windDir: string, windSpeed: string}} inputs */
function hasValidWind(inputs) {
  return isValidWindDirection(inputs.windDir) && inputs.windSpeed.trim() !== '' &&
    Number.isFinite(Number(inputs.windSpeed)) && Number(inputs.windSpeed) >= 0;
}

/** @param {{windDir: string, windSpeed: string}} inputs @param {number} runwayHeadingDeg */
export function getRunwayWindComponents(inputs, runwayHeadingDeg) {
  if (!hasValidWind(inputs) || !Number.isFinite(runwayHeadingDeg)) {
    return { headwindKnots: null, crosswindKnots: null };
  }
  const angle = (((Number(inputs.windDir) - runwayHeadingDeg + 540) % 360) - 180) * Math.PI / 180;
  const speed = Number(inputs.windSpeed);
  return { headwindKnots: speed * Math.cos(angle), crosswindKnots: Math.abs(speed * Math.sin(angle)) };
}

/** @param {ReturnType<typeof readPerformanceInputs>['takeoff']} inputs */
export function hasRequiredTakeoffInputs(inputs) {
  return hasValidWind(inputs) && inputs.oat.trim() !== '' && Number.isFinite(Number(inputs.oat)) &&
    Number.isFinite(Number(inputs.qnh)) && Number(inputs.qnh) > 0 &&
    Number.isFinite(Number(inputs.mass)) && Number(inputs.mass) > 0 &&
    inputs.flaps !== '' && inputs.antiIce !== '' && inputs.rwcc !== '';
}

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
