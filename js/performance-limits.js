// Calculation decisions use full precision; formatting belongs to the UI.

/** @param {unknown} value @returns {number | null} */
export function finiteNumber(value) {
  if ((typeof value !== 'number' && typeof value !== 'string') ||
      String(value).trim() === '' || String(value).startsWith('#')) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

/** @param {unknown} distance @param {unknown} limit @returns {boolean | null} */
export function exceedsDistanceLimit(distance, limit) {
  const actual = finiteNumber(distance);
  const available = finiteNumber(limit);
  return actual === null || available === null ? null : actual > available;
}

/** @param {unknown} headwind @param {unknown} crosswind @param {unknown} crosswindLimit
 * @returns {'normal' | 'amber' | 'red'} */
export function windLimitStatus(headwind, crosswind, crosswindLimit) {
  const xw = finiteNumber(crosswind);
  const limit = finiteNumber(crosswindLimit);
  if (xw !== null && limit !== null && xw > limit) return 'red';

  let hw = finiteNumber(headwind);
  if (hw === null && typeof headwind === 'string') {
    const tailwind = headwind.match(/([\d.]+)\s*TW/i);
    if (tailwind) hw = -Number(tailwind[1]);
  }
  if (hw === null || hw >= 0) return 'normal';
  return hw < -10 ? 'red' : 'amber';
}
