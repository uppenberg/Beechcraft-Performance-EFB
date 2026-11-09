// App state and aircraft/workbook configuration

let hfInstance;
let globalData = { airports: [], factors: {} };
const airportSelection = {
  to: { icao: '', runway: '', intersection: '' },
  ldg: { icao: '', runway: '', intersection: '' },
};
const runwaySuggestions = { to: null, ldg: null };
let runwaySuggestionRefreshTimer = null;
let appServiceWorkerRegistration = null;
let reloadAfterServiceWorkerChange = false;
let appInitializationFailed = false;
const PERSISTED_FORM_STATE_KEY_PREFIX = 'performance_form_state_v2_';
function getPersistedFormStateKey() {
  const registration = document.getElementById('global-registration')?.value;
  return PERSISTED_FORM_STATE_KEY_PREFIX + (AIRCRAFT_TYPE_BY_REGISTRATION[registration] || 'default');
}
const AIRPORT_CONTROL_IDS = new Set([
  'to-airport-icao',
  'to-airport-rwy',
  'to-airport-intersection',
  'ldg-airport-icao',
  'ldg-airport-rwy',
  'ldg-airport-intersection',
]);

const CELL_MAPPING = {
  airport: {
    sheetName: 'Airport data',
    inputs: {
      'RWY Elev [ft] (B6)': 'B6',
      'TORA [m] (C6)': 'C6',
      'TODA [m](D6)': 'D6',
      'ASDA [m](E6)': 'E6',
      'LDA [m](F6)': 'F6',
      'Slope [%](G6)': 'G6',
      'RWYHDG [°](H6)': 'H6',
      'min climb gradient OEI(I6)': 'I6',
      'Routing(L6)': 'L6',
    }
  },
  takeoff: {
    sheetName: 'Take-off',
    inputs: {
      airportAndRwy: 'C4',
      rwcc: 'C10',
      contaminant: 'C11',
      antiIce: 'C13',
      mass: 'C14',
      flaps: 'C26',
      windDir: 'C6',
      windSpeed: 'C7',
      oat: 'C8',
      qnh: 'C9',
      technique: 'F13',
    },
    outputs: {
      asda: 'C19',
      tora: 'C20',
      toda: 'C21',
      tor: 'C35',
      to_tor: 'D35',
      app_tor: 'E35',
      hwTw: 'C24',
      xw: 'C25',
      xwLimit: 'F25',
      req_climb_grad_to: 'G19',
      tod: 'C36',
      to_tod: 'D36',
      app_tod: 'E36',
      asd: 'C37',
      to_asd: 'D37',
      app_asd: 'E37',
      v1: 'C38',
      to_v1: 'D38',
      app_v1: 'E38',
      vr: 'C39',
      to_vr: 'D39',
      app_vr: 'E39',
      v2: 'C40',
      to_v2: 'D40',
      app_v2: 'E40',
      climbGrad: 'C42',
      to_climbGrad: 'D42',
      app_climbGrad: 'E42',
      emUpVref: 'C45',
      emUpDist: 'C46',
      emDownVref: 'G45',
      emDownDist: 'G46',
      escapeRoute: 'C70',
    }
  },
  landing: {
    sheetName: 'Landing',
    inputs: {
      airportAndRwy: 'C4',
      rwcc: 'C10',
      mass: 'C11',
      windDir: 'C6',
      windSpeed: 'C7',
      oat: 'C8',
      qnh: 'C9',
    },
    outputs: {
      lda: 'C18',
      hwTw: 'C21',
      xw: 'C22',
      xwLimit: 'G22',
      vrefUp: 'C26',
      ldgDistUp: 'C27',
      vrefDown: 'G26',
      ldgDistDown: 'G27',
      missedClimb: 'C31',
    }
  }
};
const OPTIONAL_AIRPORT_DATA_FIELDS = [
  'LDA [m](F6)',
  'Routing(L6)',
];
const AIRPORT_LOOKUP_CELLS_BY_PAGE = {
  to: {
    'RWY Elev [ft] (B6)': 'C16',
    'Slope [%](G6)': 'C17',
    'RWYHDG [°](H6)': 'C18',
    'ASDA [m](E6)': 'C19',
    'TORA [m] (C6)': 'C20',
    'TODA [m](D6)': 'C21',
    'LDA [m](F6)': 'C22',
    'min climb gradient OEI(I6)': 'G19',
    'Routing(L6)': 'C70',
  },
  ldg: {
    'RWY Elev [ft] (B6)': 'C15',
    'Slope [%](G6)': 'C16',
    'RWYHDG [°](H6)': 'C17',
    'LDA [m](F6)': 'C18',
  },
};
const AIRCRAFT_MODELS = {
  BE20: {
    performanceEngine: 'workbook',
    registrations: [
      { id: 'SE-LTL', workbook: 'se-ltl.xlsx' },
      { id: 'SE-KVL', workbook: 'se-kvl.xlsx' },
      { id: 'SE-MJU', workbook: 'se-mju.xlsx' },
    ],
    takeoffFlaps: [
      { value: 'UP', label: 'Flaps Up' },
      { value: 'APP', label: 'Approach' },
    ],
    massRanges: {
      takeoff: { min: 9200, max: 12500, default: 12500 },
      landing: { min: 9000, max: 12500, default: 12500 },
    },
    maxDesignLandingWeightLb: null,
  },
  B190: {
    performanceEngine: 'workbook',
    registrations: [
      { id: 'SE-MHU', workbook: 'B190.xlsx' },
      { id: 'SE-MJV', workbook: 'B190.xlsx' },
    ],
    takeoffFlaps: [
      { value: 'UP', label: 'Flaps Up' },
      { value: 'TAKE', label: 'Take-off' },
      { value: 'APP', label: 'Approach' },
    ],
    massRanges: {
      takeoff: { min: 10000, max: 16600, default: 16600 },
      landing: { min: 10000, max: 16600, default: 16100 },
    },
    maxDesignLandingWeightLb: 16100,
  },
  C56X: {
    performanceEngine: 'c56x',
    registrations: [
      { id: 'SE-RIJ', workbook: null },
    ],
    takeoffFlaps: [
      { value: '7', label: 'Flaps 7°' },
      { value: '15', label: 'Flaps 15°' },
    ],
    massRanges: {
      takeoff: { min: 13500, max: 20000, default: 20000 },
      landing: { min: 13000, max: 20000, default: 18700 },
    },
    maxDesignLandingWeightLb: 18700,
  },
};
const AIRCRAFT_REGISTRATIONS = {};
Object.entries(AIRCRAFT_MODELS).forEach(([type, model]) => {
  model.registrations.forEach(({ id, workbook }) => {
    AIRCRAFT_REGISTRATIONS[id] = {
      type,
      workbook,
      performanceEngine: model.performanceEngine,
    };
  });
});
const AIRCRAFT_TYPE_BY_REGISTRATION = Object.fromEntries(
  Object.entries(AIRCRAFT_REGISTRATIONS)
    .map(([registration, aircraft]) => [registration, aircraft.type])
);
const TAKEOFF_FLAPS_OPTIONS_BY_TYPE = Object.fromEntries(
  Object.entries(AIRCRAFT_MODELS).map(([type, model]) => [type, model.takeoffFlaps])
);
const MASS_SLIDER_RANGES_BY_TYPE = Object.fromEntries(
  Object.entries(AIRCRAFT_MODELS).map(([type, model]) => [type, model.massRanges])
);
const MAX_DESIGN_LANDING_WEIGHT_LB_BY_TYPE = Object.fromEntries(
  Object.entries(AIRCRAFT_MODELS)
    .filter(([, model]) => Number.isFinite(model.maxDesignLandingWeightLb))
    .map(([type, model]) => [type, model.maxDesignLandingWeightLb])
);

function configureAircraftRegistrationOptions(select) {
  if (!select) return;
  const registrations = [];
  Object.entries(AIRCRAFT_MODELS).forEach(([type, model]) => {
    model.registrations.forEach(({ id }) => {
      registrations.push(new Option(`${id} (${type})`, id));
    });
  });
  select.replaceChildren(...registrations);
  select.value = registrations[0]?.value || '';
}

function isC56xSelected() {
  return AIRCRAFT_TYPE_BY_REGISTRATION[document.getElementById('global-registration')?.value] === 'C56X';
}
const TAKEOFF_RESULT_COLUMN_BY_FLAPS = { UP: 'C', TAKE: 'D', APP: 'E' };
let pendingRegistrationChange = null;
