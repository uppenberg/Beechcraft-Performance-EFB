const globals = require('globals');

const rules = {
  'no-undef': 'error',
  'no-unused-vars': ['error', { args: 'none' }],
  'no-unreachable': 'error',
  'no-dupe-args': 'error',
  'no-dupe-keys': 'error',
  'no-self-assign': 'error',
};

// These globals are supplied by the locally bundled workbook libraries and
// by the classic C56X data scripts loaded before their calculators are used.
const performanceGlobals = Object.fromEntries([
  'XLSX', 'HyperFormula', 'maxXwindByRCC', 'calculateC56xPressureAltitude',
  'getC56xTakeoffFieldLengths', 'getC56xTakeoffSpeeds',
  'getC56xSecondSegmentClimbGradient', 'getC56xMaxTakeoffWeight',
  'getC56xLandingPerformance', 'C56X_MAX_DESIGN_LANDING_WEIGHT_LB',
  'C56X_MIN_APPROACH_CLIMB_GRADIENT_PERCENT', 'C56X_MIN_LANDING_CLIMB_GRADIENT_PERCENT',
].map((name) => [name, 'readonly']));

module.exports = [
  { files: ['js/*.js'], languageOptions: { sourceType: 'module', globals: { ...globals.browser, ...performanceGlobals } }, rules },
  { files: ['js/performance-limits.js'], languageOptions: { sourceType: 'module' }, rules },
  { files: ['js/performance-inputs.js'], languageOptions: { sourceType: 'module' }, rules },
  { files: ['sw.js'], languageOptions: { sourceType: 'script', globals: globals.serviceworker }, rules },
  { files: ['tools/generate-asset-manifest.js', 'tests/support/server.js'],
    languageOptions: { sourceType: 'commonjs', globals: globals.node }, rules },
];
