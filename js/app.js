import { MetarWeather } from './metar-weather.js';
import * as state from './app-state.js';
import * as aircraft from './aircraft-ui.js';
import * as offline from './offline-ui.js';
import * as workbookData from './workbook-data.js';
import * as airports from './airport-ui.js';
import * as workbookEngine from './workbook-engine.js';
import * as c56x from './c56x-ui.js';
import * as results from './results-ui.js';

let pendingNextLeg = null;

function showNextLeg() {
  const departure = state.AppState.airportSelection.to.icao;
  const arrival = state.AppState.airportSelection.ldg.icao;
  const mass = Number(document.getElementById('ldg-mass').value);
  const takeoffRwcc = document.getElementById('to-rwcc').value;
  const landingRwcc = document.getElementById('ldg-rwcc').value;
  const registration = document.getElementById('global-registration').value;
  const ranges = state.MASS_SLIDER_RANGES_BY_TYPE[state.AIRCRAFT_TYPE_BY_REGISTRATION[registration]];
  if (!ranges) return;
  const landingMass = ranges.landing.default;
  pendingNextLeg = { departure: arrival, arrival: departure, mass, landingMass, takeoffRwcc, landingRwcc };

  const summary = document.getElementById('next-leg-summary');
  summary.replaceChildren();
  for (const [label, value] of [
    ['Departure', `${departure || 'Not selected'} → ${arrival || 'Not selected'}`],
    ['Destination', `${arrival || 'Not selected'} → ${departure || 'Not selected'}`],
    ['Take-off mass', `${document.getElementById('to-mass').value} → ${mass} lb (previous landing mass)`],
    ['Landing mass', `${mass} → ${landingMass} lb (aircraft default)`],
    ['Take-off RWCC', `${takeoffRwcc} → ${landingRwcc} (previous landing RWCC)`],
    ['Landing RWCC', `${landingRwcc} → ${takeoffRwcc} (previous take-off RWCC)`],
  ]) {
    const term = document.createElement('dt');
    const description = document.createElement('dd');
    term.textContent = label;
    description.textContent = value;
    summary.append(term, description);
  }

  const error = document.getElementById('next-leg-error');
  let message = '';
  if (!airports.getAirportRows(departure).length || !airports.getAirportRows(arrival).length) {
    message = 'Select valid departure and landing airports before starting the next leg.';
  } else if (!Number.isFinite(mass) || mass < ranges.takeoff.min || mass > ranges.takeoff.max) {
    message = `The previous landing mass is outside the take-off range (${ranges.takeoff.min}–${ranges.takeoff.max} lb). Set an applicable landing mass before continuing.`;
  }
  error.textContent = message;
  error.hidden = !message;
  document.getElementById('next-leg-confirm').disabled = Boolean(message);
  document.getElementById('next-leg-dialog').showModal();
}

function cancelNextLeg() {
  pendingNextLeg = null;
  document.getElementById('next-leg-dialog').close();
}

function confirmNextLeg() {
  if (!pendingNextLeg) return;
  const next = pendingNextLeg;
  pendingNextLeg = null;
  document.getElementById('next-leg-dialog').close();
  for (const [prefix, icao] of [['to', next.departure], ['ldg', next.arrival]]) {
    if (state.AppState.airportSelection[prefix].icao === icao) {
      airports.handleAirportRunwayChange('', prefix);
      results.fetchMetarForAirport(prefix);
    } else {
      airports.handleAirportIcaoInput(icao, prefix);
    }
  }
  const takeoffMass = document.getElementById('to-mass');
  const landingMass = document.getElementById('ldg-mass');
  const takeoffRwcc = document.getElementById('to-rwcc');
  const landingRwcc = document.getElementById('ldg-rwcc');
  takeoffMass.value = String(next.mass);
  landingMass.value = String(next.landingMass);
  takeoffRwcc.value = next.landingRwcc;
  landingRwcc.value = next.takeoffRwcc;
  takeoffMass.dispatchEvent(new Event('input', { bubbles: true }));
  landingMass.dispatchEvent(new Event('input', { bubbles: true }));
  takeoffRwcc.dispatchEvent(new Event('change', { bubbles: true }));
  landingRwcc.dispatchEvent(new Event('change', { bubbles: true }));
  airports.switchTab('takeoff');
}

window.BeechcraftApp = Object.freeze({
  metar: Object.freeze({ MetarWeather }),
  state,
  aircraft,
  offline,
  workbookData,
  airports,
  workbookEngine,
  c56x,
  results,
});

export const uiActions = Object.freeze({
  showNextLeg: () => showNextLeg(),
  cancelNextLeg: () => cancelNextLeg(),
  confirmNextLeg: () => confirmNextLeg(),
  handleRegistrationChange: (value) => aircraft.handleRegistrationChange(value),
  cancelAircraftTypeChange: () => aircraft.cancelAircraftTypeChange(),
  confirmAircraftTypeChange: () => aircraft.confirmAircraftTypeChange(),
  switchTab: (tabName, event) => airports.switchTab(tabName, event),
  handleAirportIcaoInput: (value, prefix) => airports.handleAirportIcaoInput(value, prefix),
  handleAirportIcaoKeydown: (event, inputId) => airports.handleAirportIcaoKeydown(event, inputId),
  showAirportIcaoSuggestions: (value, inputId) => airports.showAirportIcaoSuggestions(value, inputId),
  handleAirportRunwayChange: (runway, prefix) => airports.handleAirportRunwayChange(runway, prefix),
  handleLandingAirportRunwayChange: (runway, prefix) => airports.handleLandingAirportRunwayChange(runway, prefix),
  handleAirportIntersectionChange: (intersection, prefix) => airports.handleAirportIntersectionChange(intersection, prefix),
  fetchMetarForSelectedAirport: (prefix) => results.fetchMetarForSelectedAirport(prefix),
  handleManualWeatherInput: (sheetType, field, element) =>
    workbookEngine.handleManualWeatherInput(sheetType, field, element),
  handleTakeoffMass: (value) => workbookEngine.handleTakeoffMass(value),
  handleLandingMass: (value) => workbookEngine.handleLandingMass(value),
  handleTakeoffFlaps: (value) => workbookEngine.handleTakeoffFlaps(value),
  handleLandingFlaps: () => workbookEngine.handleLandingFlaps(),
  handleTakeoffAntiIce: (value) => workbookEngine.handleTakeoffAntiIce(value),
  handleLandingAntiIce: () => workbookEngine.handleLandingAntiIce(),
  handleTakeoffReversers: (value) => workbookEngine.handleTakeoffReversers(value),
  handleLandingReversers: () => workbookEngine.handleLandingReversers(),
  handleTakeoffRwcc: (value) => workbookEngine.handleTakeoffRwcc(value),
  handleLandingRwcc: (value) => workbookEngine.handleLandingRwcc(value),
  handleTakeoffDeice: () => workbookEngine.handleTakeoffDeice(),
  updateEngineCellVal: (sheetType, field, value) =>
    workbookEngine.updateEngineCellVal(sheetType, field, value),
  selectText: (element) => {
    if (element.matches('#to-wind-spd, #ldg-wind-spd')) {
      element.dataset.lastValidValue = element.value;
    }
    element.select();
  },
});

function resolveActionArgument(argument, element, event) {
  if (argument === '$value') return element.value;
  if (argument === '$element') return element;
  if (argument === '$event') return event;
  if (argument === '$targetEvent') return { currentTarget: element, target: element };
  return argument;
}

function dispatchUiActions(event) {
  const attribute = `data-action-${event.type}`;
  const element = event.target?.closest?.(`[${attribute}]`);
  const descriptors = element?.getAttribute(attribute);
  if (!element || !descriptors) return;

  descriptors.split(';').forEach((descriptor) => {
    const [name, ...rawArguments] = descriptor.split(':');
    const action = uiActions[name];
    if (!action) {
      console.error(`Unknown UI action: ${name}`);
      return;
    }
    action(...rawArguments.map((argument) => resolveActionArgument(argument, element, event)));
  });
}

['click', 'change', 'input', 'keydown', 'focus'].forEach((eventType) => {
  document.addEventListener(eventType, dispatchUiActions, eventType === 'focus');
});

document.addEventListener('DOMContentLoaded', aircraft.init);
