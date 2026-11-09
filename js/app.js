import { MetarWeather } from './metar-weather.js';
import * as state from './app-state.js';
import * as aircraft from './aircraft-ui.js';
import * as offline from './offline-ui.js';
import * as workbookData from './workbook-data.js';
import * as airports from './airport-ui.js';
import * as workbookEngine from './workbook-engine.js';
import * as c56x from './c56x-ui.js';
import * as results from './results-ui.js';

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

const uiActions = Object.freeze({
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
