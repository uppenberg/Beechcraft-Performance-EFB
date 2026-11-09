import { getAirportRows, showAirportSelectionError, switchTab } from './airport-ui.js';
import { AIRCRAFT_REGISTRATIONS, AIRCRAFT_TYPE_BY_REGISTRATION, AppState, CELL_MAPPING, MASS_SLIDER_RANGES_BY_TYPE, MAX_DESIGN_LANDING_WEIGHT_LB_BY_TYPE, TAKEOFF_FLAPS_OPTIONS_BY_TYPE, configureAircraftRegistrationOptions } from './app-state.js';
import { updateC56xTakeoffFieldLength, updateMaxTakeoffMass } from './c56x-ui.js';
import { checkOfflineData, registerAppServiceWorker, setupSettingsMenu } from './offline-ui.js';
import { fetchMetarForAirport } from './results-ui.js';
import { loadAirportDatabase, loadC56xPerformanceData, loadData, populateAirportSelects, restorePersistedFormState, setupEventListeners } from './workbook-data.js';
import { getOutputVal, handleLandingMass, handleTakeoffMass, updateC56xLanding, updateEngineCellVal } from './workbook-engine.js';


// Aircraft selection and application startup

export function configureTakeoffFlaps(registration) {
  const select = document.getElementById('to-flaps');
  const options = TAKEOFF_FLAPS_OPTIONS_BY_TYPE[AIRCRAFT_TYPE_BY_REGISTRATION[registration]];
  if (!select || !options) return;

  const selectedValue = options.some((option) => option.value === select.value)
    ? select.value
    : options[0].value;
  select.replaceChildren(...options.map((option) => new Option(option.label, option.value)));
  select.value = selectedValue;
}

export function configureC56xRunwayInputs(registration) {
  if (AIRCRAFT_TYPE_BY_REGISTRATION[registration] !== 'C56X') return;

  const antiIceSelect = document.getElementById('to-anti-ice');
  if (antiIceSelect) antiIceSelect.value = 'ON';

  const rwccSelect = document.getElementById('to-rwcc');
  if (rwccSelect) {
    const selectedValue = ['1', '2', '3', '4', '5', '6'].includes(rwccSelect.value)
      ? rwccSelect.value
      : '6';
    rwccSelect.replaceChildren(...['1', '2', '3', '4', '5', '6'].map(
      (code) => new Option(code, code)
    ));
    rwccSelect.value = selectedValue;
  }

  const reversersRow = document.getElementById('to-reversers-row');
  if (reversersRow) reversersRow.hidden = false;
  const deiceRow = document.getElementById('to-deice-row');
  if (deiceRow) deiceRow.hidden = false;
  const reversersSelect = document.getElementById('to-reversers');
  if (reversersSelect && !['AVAILABLE', 'INOP'].includes(reversersSelect.value)) {
    reversersSelect.value = 'AVAILABLE';
  }
}

export function configureC56xLandingPage(registration) {
  if (AIRCRAFT_TYPE_BY_REGISTRATION[registration] !== 'C56X') return;

  document.querySelectorAll('.ldg-excel-only').forEach((element) => { element.hidden = true; });
  document.querySelectorAll('.ldg-c56x-only').forEach((element) => { element.hidden = false; });
  const flapsRow = document.getElementById('ldg-flaps-row');
  if (flapsRow) flapsRow.hidden = false;
  const flapsSelect = document.getElementById('ldg-flaps');
  if (flapsSelect) {
    flapsSelect.replaceChildren(new Option('Flaps 35°', '35'));
    flapsSelect.value = '35';
  }
  const antiIceRow = document.getElementById('ldg-anti-ice-row');
  if (antiIceRow) antiIceRow.hidden = false;
  const reversersRow = document.getElementById('ldg-reversers-row');
  if (reversersRow) reversersRow.hidden = false;
  const reversersSelect = document.getElementById('ldg-reversers');
  if (reversersSelect && !['AVAILABLE', 'INOP'].includes(reversersSelect.value)) {
    reversersSelect.value = 'AVAILABLE';
  }
  const climbLabel = document.getElementById('ldg-missed-climb-label');
  if (climbLabel) climbLabel.textContent = 'Approach / Landing climb gradient';
  ['ldg-missed-climb', 'ldg-missed-climb-status'].forEach((id) => {
    const element = document.getElementById(id);
    if (element) element.hidden = true;
  });
  const climbLines = document.getElementById('ldg-c56x-climb');
  if (climbLines) climbLines.hidden = false;
  const distanceMarker = document.getElementById('ldg-dist-down-marker');
  if (distanceMarker) distanceMarker.dataset.label = 'LD';
  const vrefLabel = document.getElementById('res-ldg-vref-label');
  if (vrefLabel) vrefLabel.hidden = true;
  const vrefValue = document.getElementById('res-ldg-vref-value');
  if (vrefValue) vrefValue.hidden = true;
  const speeds = document.getElementById('ldg-c56x-speeds');
  if (speeds) speeds.hidden = false;
  const headerBadge = document.getElementById('ldg-header-badge');
  if (headerBadge) headerBadge.textContent = 'AFM revision:56XFM-13';
  const ldgTitle = document.getElementById('ldg-header-title');
  if (ldgTitle) ldgTitle.textContent = 'C56X Landing Performance';
}

export function updateLandingOverweightWarning() {
  const aircraftType = AIRCRAFT_TYPE_BY_REGISTRATION[
    document.getElementById('global-registration')?.value
  ];
  const limitLb = MAX_DESIGN_LANDING_WEIGHT_LB_BY_TYPE[aircraftType];
  const rawMass = document.getElementById('ldg-mass')?.value;
  const weightLb = rawMass === undefined || String(rawMass).trim() === '' ? NaN : Number(rawMass);
  const overweight = Boolean(limitLb) && weightLb > limitLb;
  const warning = document.getElementById('ldg-overweight-warning');
  if (warning) {
    warning.hidden = !overweight;
    if (limitLb) {
      const formattedLimit = limitLb.toLocaleString('en-US');
      warning.replaceChildren(
        Object.assign(document.createElement('strong'), { textContent: 'Emergency use only.' }),
        ` Landing mass is above the maximum design landing weight of ${formattedLimit} lb. ` +
        `These figures are provided only for an emergency that requires landing above ${formattedLimit} lb. ` +
        'Do not plan a normal landing at this weight; refer to the Abnormal/Emergency procedures.'
      );
    }
  }
  const massLabel = document.getElementById('ldg-mass-val');
  if (massLabel) massLabel.style.color = overweight ? '#f85149' : 'var(--accent, #00d2ff)';
  return overweight;
}

export function configureMassSliders(registration) {
  const ranges = MASS_SLIDER_RANGES_BY_TYPE[AIRCRAFT_TYPE_BY_REGISTRATION[registration]];
  if (!ranges) return;

  Object.entries(ranges).forEach(([sheetType, range]) => {
    const prefix = sheetType === 'takeoff' ? 'to' : 'ldg';
    const slider = document.getElementById(`${prefix}-mass`);
    if (!slider) return;

    slider.min = String(range.min);
    slider.max = String(range.max);
    slider.value = String(range.default);
    const valueLabel = document.getElementById(`${prefix}-mass-val`);
    if (valueLabel) valueLabel.textContent = slider.value;
  });
  updateLandingOverweightWarning();
}

export function configureTakeoffTechnique(registration, syncFromWorkbook = false) {
  const row = document.getElementById('to-technique-row');
  const select = document.getElementById('to-technique');
  const isB190 = AIRCRAFT_TYPE_BY_REGISTRATION[registration] === 'B190';
  if (row) row.hidden = !isB190;
  if (!isB190 || !syncFromWorkbook || !select) return;

  const workbookValue = getOutputVal(CELL_MAPPING.takeoff.sheetName, CELL_MAPPING.takeoff.inputs.technique, false);
  if ([...select.options].some((option) => option.value === String(workbookValue))) {
    select.value = String(workbookValue);
  }
}

export function showRegistrationError(message) {
  const errorElement = document.getElementById('registration-error');
  if (!errorElement) return;
  errorElement.textContent = message;
  errorElement.hidden = false;
}

export function clearRegistrationError() {
  const errorElement = document.getElementById('registration-error');
  if (!errorElement) return;
  errorElement.textContent = '';
  errorElement.hidden = true;
}

export function applyRegistrationChange(registration) {
  localStorage.setItem('selected_reg', registration);
  clearRegistrationError();
  window.location.reload();
}

export function handleRegistrationChange(registration) {
  const registrationSelect = document.getElementById('global-registration');
  if (!registrationSelect) return;

  if (!AIRCRAFT_TYPE_BY_REGISTRATION[registration]) {
    registrationSelect.value = 'SE-LTL';
    showRegistrationError(`No performancedata is available for ${registration}. `);
    return;
  }

  const previousRegistration = localStorage.getItem('selected_reg') || 'SE-LTL';
  const previousType = AIRCRAFT_TYPE_BY_REGISTRATION[previousRegistration];
  const nextType = AIRCRAFT_TYPE_BY_REGISTRATION[registration];
  if (previousType && nextType && previousType !== nextType) {
    const message = document.getElementById('aircraft-change-message');
    if (message) {
      message.textContent = `You are switching from ${previousType} to ${nextType}. Performance data and calculations are aircraft-specific. Are you absolutely sure you want to continue?`;
    }
    const warningDialog = document.getElementById('aircraft-change-dialog');
    if (!warningDialog || typeof warningDialog.showModal !== 'function') {
      registrationSelect.value = previousRegistration;
      showRegistrationError('Cannot confirm the aircraft type change because the warning dialog is unavailable.');
      return;
    }
    AppState.pendingRegistrationChange = { previousRegistration, registration };
    if (!warningDialog.open) warningDialog.showModal();
    return;
  }

  applyRegistrationChange(registration);
}

export function cancelAircraftTypeChange() {
  if (AppState.pendingRegistrationChange) {
    const registrationSelect = document.getElementById('global-registration');
    if (registrationSelect) registrationSelect.value = AppState.pendingRegistrationChange.previousRegistration;
  }
  AppState.pendingRegistrationChange = null;
  const warningDialog = document.getElementById('aircraft-change-dialog');
  if (warningDialog?.open) warningDialog.close();
}

export function confirmAircraftTypeChange() {
  if (!AppState.pendingRegistrationChange) return;
  const { registration } = AppState.pendingRegistrationChange;
  AppState.pendingRegistrationChange = null;
  const warningDialog = document.getElementById('aircraft-change-dialog');
  if (warningDialog?.open) warningDialog.close();
  applyRegistrationChange(registration);
}

// 1. Huvudfunktion som kör igång allt i rätt ordning
export async function init() {
  try {
    const warningDialog = document.getElementById('aircraft-change-dialog');
    warningDialog?.addEventListener('cancel', cancelAircraftTypeChange);

    const versionElement = document.getElementById('app-version');
    if (versionElement) versionElement.textContent = `v${window.APP_VERSION}`;

    console.log("Startar PWA och laddar data...");

    const registrationSelect = document.getElementById('global-registration');
    configureAircraftRegistrationOptions(registrationSelect);
    const savedRegistration = localStorage.getItem('selected_reg');
    if (registrationSelect && savedRegistration && AIRCRAFT_TYPE_BY_REGISTRATION[savedRegistration]) {
      registrationSelect.value = savedRegistration;
    }
    if (registrationSelect && !AIRCRAFT_TYPE_BY_REGISTRATION[registrationSelect.value]) {
      const unsupportedRegistration = registrationSelect.value;
      registrationSelect.value = 'SE-LTL';
      localStorage.setItem('selected_reg', 'SE-LTL');
      showRegistrationError(`No performancedata is available for ${unsupportedRegistration}. `);
    }
    configureTakeoffFlaps(registrationSelect?.value || 'SE-LTL');
    const selectedRegistration = registrationSelect?.value || 'SE-LTL';
    configureMassSliders(selectedRegistration);
    configureTakeoffTechnique(selectedRegistration);

    const selectedAircraft = AIRCRAFT_REGISTRATIONS[selectedRegistration];
    if (!selectedAircraft) {
      throw new Error(`No aircraft configuration is available for ${selectedRegistration}.`);
    }

    if (selectedAircraft.performanceEngine === 'c56x') {
      configureC56xRunwayInputs(selectedRegistration);
      configureC56xLandingPage(selectedRegistration);
      await loadC56xPerformanceData();
      const c56xPerformance = document.getElementById('c56x-takeoff-performance');
      if (c56xPerformance) c56xPerformance.hidden = false;
      [
        'card-emergency-return',
        'takeoff-performance-heading',
        'takeoff-performance-checklist',
      ].forEach((id) => {
        const element = document.getElementById(id);
        if (element) {
          element.hidden = true;
          element.style.display = 'none';
        }
      });
      const maxMassTitle = document.getElementById('max-to-mass-title');
      if (maxMassTitle) maxMassTitle.textContent = 'Max take-off mass, current setup';

      AppState.globalData.airports = await loadAirportDatabase();
      populateAirportSelects();
      setupEventListeners();
      restorePersistedFormState();
      const c56xRwcc = document.getElementById('to-rwcc');
      if (c56xRwcc && !['1', '2', '3', '4', '5', '6'].includes(c56xRwcc.value)) c56xRwcc.value = '6';
      updateMaxTakeoffMass();
      updateC56xTakeoffFieldLength();
      updateC56xLanding();
      if (localStorage.getItem('selected_tab') === 'landing') switchTab('landing');
      ['to', 'ldg'].forEach((prefix) => {
        if (getAirportRows(AppState.airportSelection[prefix].icao).length) {
          fetchMetarForAirport(prefix);
        }
      });
      clearRegistrationError();
      AppState.appInitializationFailed = false;
      setupSettingsMenu();
      registerAppServiceWorker();
      return;
    }

    if (selectedAircraft.performanceEngine !== 'workbook') {
      throw new Error(
        `Unsupported performance engine "${selectedAircraft.performanceEngine}" for ${selectedRegistration}.`
      );
    }
    if (!selectedAircraft.workbook) {
      throw new Error(`No workbook is configured for ${selectedRegistration}.`);
    }

    // Ladda in Excel och skapa HyperFormula-instansen
    await loadData(selectedRegistration);
    configureTakeoffTechnique(selectedRegistration, true);
    if (AIRCRAFT_TYPE_BY_REGISTRATION[selectedRegistration] === 'B190') {
      handleTakeoffMass(document.getElementById('to-mass').value);
      handleLandingMass(document.getElementById('ldg-mass').value);
    }
    AppState.globalData.airports = await loadAirportDatabase();

    // Fyll rullistor och koppla eventlyssnare
    populateAirportSelects();
    setupEventListeners();
    restorePersistedFormState();
    const savedTab = localStorage.getItem('selected_tab');
    switchTab(savedTab === 'landing' ? 'landing' : 'takeoff');
    ['to', 'ldg'].forEach((prefix) => {
      if (getAirportRows(AppState.airportSelection[prefix].icao).length) {
        fetchMetarForAirport(prefix);
      }
    });
    const antiIceSelect = document.getElementById('to-anti-ice');
    if (antiIceSelect) {
      updateEngineCellVal('takeoff', 'antiIce', antiIceSelect.value);
    }

    AppState.appInitializationFailed = false;
    setupSettingsMenu();
    registerAppServiceWorker();

    console.log("Appen är helt initierad!");
  } catch (error) {
    console.error("Kunde inte slutföra init():", error);
    AppState.appInitializationFailed = true;
    setupSettingsMenu();
    showAirportSelectionError(
      `Could not initialize the performance calculator: ${error.message} ` +
      'Open Settings → Offline use to check or download missing files.'
    );
    checkOfflineData();
  }
}
