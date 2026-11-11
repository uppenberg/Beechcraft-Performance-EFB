import { AIRPORT_LOOKUP_CELLS_BY_PAGE, AppState, CELL_MAPPING, OPTIONAL_AIRPORT_DATA_FIELDS, isC56xSelected } from './app-state.js';
import { updateC56xTakeoffFieldLength, updateMaxTakeoffMass } from './c56x-ui.js';
import { MetarWeather } from './metar-weather.js';
import { updateCustomAirportIndicator } from './offline-ui.js';
import { clearAirportMetar, exceedsDistanceLimit, fetchMetarForAirport, finiteDistance, renderLandingChart, renderTakeoffChart } from './results-ui.js';
import { isCustomAirportEnabled, restoreSavedMetar } from './workbook-data.js';
import { getOutputVal, getTakeoffOutput, parseCellRef, setWorkbookCellValues } from './workbook-adapter.js';
import { refreshOutputs, updateC56xLanding } from './workbook-engine.js';


// Airport selection and runway interaction

export function switchTab(tabName, event) {
  if (tabName !== 'takeoff' && tabName !== 'landing') return;
  localStorage.setItem('selected_tab', tabName);

  document.querySelectorAll('.page').forEach(page => {
    page.style.display = 'none';
    page.classList.remove('active');
  });

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
    btn.style.background = '#161b22';
    btn.style.color = '#8b949e';
  });

  const targetPage = document.getElementById('page-' + tabName);
  if (targetPage) {
    targetPage.style.display = 'block';
    targetPage.classList.add('active');
  }

  if (tabName === 'takeoff') {
    const config = CELL_MAPPING.takeoff;
    renderTakeoffChart(
      getTakeoffOutput('tor', false),
      getTakeoffOutput('tod', false),
      getTakeoffOutput('asd', false),
      getOutputVal(config.sheetName, config.outputs.tora, false),
      getOutputVal(config.sheetName, config.outputs.toda, false),
      getOutputVal(config.sheetName, config.outputs.asda, false)
    );
  } else if (tabName === 'landing') {
    if (isC56xSelected()) {
      updateC56xLanding();
    } else {
      const config = CELL_MAPPING.landing;
      renderLandingChart(
        getOutputVal(config.sheetName, config.outputs.ldgDistUp, false),
        getOutputVal(config.sheetName, config.outputs.ldgDistDown, false),
        getOutputVal(config.sheetName, config.outputs.lda, false)
      );
    }
  }

  const activeButton = event?.currentTarget ||
    document.querySelectorAll('.tab-btn')[tabName === 'takeoff' ? 0 : 1];
  if (activeButton) {
    activeButton.classList.add('active');
    activeButton.style.background = '#21262d';
    activeButton.style.color = '#fff';
  }
}

let airportIndexSource = null;
let airportIndex = new Map();
let airportIcaoCodes = [];

export function ensureAirportIndex() {
  if (airportIndexSource === AppState.globalData.airports) return;
  airportIndexSource = AppState.globalData.airports;
  airportIndex = new Map();
  AppState.globalData.airports.forEach((airport) => {
    const key = airport.ICAO.trim().toUpperCase();
    if (!airportIndex.has(key)) airportIndex.set(key, []);
    airportIndex.get(key).push(airport);
  });
  airportIcaoCodes = [...airportIndex.keys()].sort();
}

export function getAirportRows(icao) {
  if (!icao) return [];
  ensureAirportIndex();
  return airportIndex.get(icao.trim().toUpperCase()) || [];
}

export function getRunwayRows(icao, runway) {
  if (!runway) return [];
  return getAirportRows(icao).filter((airport) => airport.RWY === runway);
}

const TAKEOFF_DISTANCE_FIELDS = ['TORA [m] (C6)', 'TODA [m](D6)', 'ASDA [m](E6)'];

function hasUsableDistance(airport, field) {
  const value = airportCellValue(airport?.[field]);
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function runwayRowsForPage(icao, runway, prefix) {
  const rows = getRunwayRows(icao, runway);
  return rows.filter((airport) => prefix === 'ldg'
    ? hasUsableDistance(airport, 'LDA [m](F6)')
    : TAKEOFF_DISTANCE_FIELDS.every((field) => hasUsableDistance(airport, field)));
}

function runwayAvailableForPage(icao, runway, prefix) {
  return runwayRowsForPage(icao, runway, prefix).length > 0;
}

export function getSelectedAirportRecord(prefix) {
  const selection = AppState.airportSelection[prefix];
  const runwayRows = runwayRowsForPage(selection.icao, selection.runway, prefix);
  if (prefix === 'ldg') return runwayRows.find((airport) => !airport.Intersection) || runwayRows[0] || null;
  if (selection.intersection) {
    return runwayRows.find((airport) => airport.Intersection === selection.intersection) || null;
  }
  return runwayRows.find((airport) => !airport.Intersection) || null;
}

export function getLandingAirportRecord(icao, runway) {
  const runwayRows = runwayRowsForPage(icao, runway, 'ldg');
  return runwayRows.find((airport) => !airport.Intersection) || runwayRows[0] || null;
}

export function updateRunwayVisualizationTitle() {
  const takeoffTitle = document.getElementById('takeoff-runway-visualization-title');
  const landingTitle = document.getElementById('landing-runway-visualization-title');
  const takeoff = AppState.airportSelection.to;
  const landing = AppState.airportSelection.ldg;
  if (takeoffTitle) {
    const intersectionLabel = takeoff.intersection ? ` intersection ${takeoff.intersection}` : '';
    takeoffTitle.textContent = takeoff.runway
      ? `Runway ${takeoff.runway}${intersectionLabel} visualization`
      : 'Runway visualization';
  }
  if (landingTitle) landingTitle.textContent = landing.runway
    ? `Runway ${landing.runway} visualization`
    : 'Runway visualization';
}

setInterval(() => {
  document.querySelectorAll('select.needs-selection').forEach((select) => {
    select.classList.toggle('blink-on');
  });
}, 700);

export function syncAirportControls() {
  updateCustomAirportIndicator();
  ['to', 'ldg'].forEach((prefix) => {
    const selection = AppState.airportSelection[prefix];
    const icao = selection.icao;
    const airportRows = getAirportRows(icao);
    const runways = [...new Set(airportRows.map((airport) => airport.RWY))]
      .filter((runway) => runwayAvailableForPage(icao, runway, prefix));
    if (!runways.includes(selection.runway)) {
      selection.runway = '';
      selection.intersection = '';
    }
    const icaoInput = document.getElementById(`${prefix}-airport-icao`);
    const runwaySelect = document.getElementById(`${prefix}-airport-rwy`);
    const intersectionSelect = document.getElementById(`${prefix}-airport-intersection`);
    const intersectionRow = document.getElementById(`${prefix}-intersection-row`);

    if (icaoInput) icaoInput.value = icao;
    if (runwaySelect) {
      runwaySelect.replaceChildren(new Option(
        runways.length ? 'Choose runway' : 'Enter an ICAO code first',
        ''
      ));
      runways.forEach((runway) => runwaySelect.appendChild(new Option(runway, runway)));
      runwaySelect.value = runways.includes(selection.runway) ? selection.runway : '';
      runwaySelect.classList.toggle('needs-selection', runways.length > 0 && !runwaySelect.value);
    }

    const runwayRows = runwayRowsForPage(icao, selection.runway, prefix);
    const intersections = [...new Set(
      runwayRows.map((airport) => airport.Intersection).filter(Boolean)
    )];
    const hasFullRunway = runwayRows.some((airport) => !airport.Intersection);
    if (intersectionSelect) {
      intersectionSelect.replaceChildren();
      if (hasFullRunway) {
        intersectionSelect.appendChild(new Option('Full runway', ''));
      } else {
        intersectionSelect.appendChild(new Option('Choose intersection', ''));
      }
      intersections.forEach((intersection) =>
        intersectionSelect.appendChild(new Option(intersection, intersection))
      );
      intersectionSelect.value = intersections.includes(selection.intersection)
        ? selection.intersection
        : '';
    }
    if (intersectionRow) intersectionRow.hidden = intersections.length === 0;
  });
  updateRunwayVisualizationTitle();
}

export function updateRunwaySuggestion(prefix, message, suggestion = null) {
  AppState.runwaySuggestions[prefix] = suggestion;
  {
    const row = document.getElementById(`${prefix}-runway-suggestion-row`);
    const text = document.getElementById(`${prefix}-runway-suggestion-text`);
    const optionsContainer = document.getElementById(`${prefix}-runway-suggestion-options`);
    if (!row || !text || !optionsContainer) return;

    row.hidden = !message;
    text.textContent = message;
    optionsContainer.replaceChildren();
    if (!suggestion) return;

    const selection = AppState.airportSelection[prefix];
    const runwayRows = getRunwayRows(selection.icao, suggestion.runway);
    const landingRecord = getLandingAirportRecord(selection.icao, suggestion.runway);
    const displayRows = prefix === 'ldg'
      ? (landingRecord ? [landingRecord] : [])
      : runwayRows;
    const distances = [
      ['TORA', 'TORA [m] (C6)'],
      ['TODA', 'TODA [m](D6)'],
      ['ASDA', 'ASDA [m](E6)'],
    ];
    if (prefix === 'ldg') {
      distances.splice(0, distances.length, ['LDA', 'LDA [m](F6)']);
    } else {
      distances.push(['LDA', 'LDA [m](F6)']);
    }
    displayRows.forEach((airport) => {
      const option = document.createElement('div');
      option.className = 'runway-suggestion-option';

      const label = document.createElement('strong');
      label.className = 'runway-suggestion-status';
      const takeoffAvailability = prefix === 'to'
        ? evaluateTakeoffRunwayAvailability(airport)
        : null;
      label.textContent = prefix === 'ldg'
        ? 'Full runway LDA available'
        : airport.Intersection
          ? `Intersection ${airport.Intersection} ${takeoffAvailability.available ? 'available' : `unavailable — ${takeoffAvailability.reasons.join(', ')}`}`
          : `Full runway ${takeoffAvailability.available ? 'available' : `unavailable — ${takeoffAvailability.reasons.join(', ')}`}`;
      option.appendChild(label);
      if (takeoffAvailability) {
        label.classList.toggle('is-available', takeoffAvailability.available);
        label.classList.toggle('is-unavailable', !takeoffAvailability.available);
      }

      const distanceList = document.createElement('p');
      distanceList.className = 'runway-suggestion-distances';
      distanceList.textContent = distances
        .map(([name, field]) => {
          const value = airportCellValue(airport[field]);
          return `${name}: ${typeof value === 'number' ? Math.round(value) : value ?? '—'} m`;
        })
        .join(' | ');
      option.appendChild(distanceList);

      const selectButton = document.createElement('button');
      selectButton.type = 'button';
      selectButton.className = 'runway-suggestion-button';
      const buttonLabel = prefix === 'ldg'
        ? `Use RWY ${suggestion.runway}`
        : airport.Intersection
          ? `Use RWY ${suggestion.runway}, intersection ${airport.Intersection}`
          : `Use RWY ${suggestion.runway}, full runway`;
      const selectedIntersection = prefix === 'ldg'
        ? (landingRecord?.Intersection || '')
        : (airport.Intersection || '');
      const isSelected = selection.runway === suggestion.runway &&
        (selection.intersection || '') === selectedIntersection;
      selectButton.textContent = takeoffAvailability && !takeoffAvailability.available
        ? 'Unavailable for current conditions'
        : isSelected
          ? `Selected — ${buttonLabel.replace(/^Use /, '')}`
          : buttonLabel;
      selectButton.disabled = isSelected || Boolean(
        takeoffAvailability && !takeoffAvailability.available
      );
      selectButton.setAttribute('aria-pressed', String(isSelected));
      selectButton.addEventListener('click', () => {
        if (prefix === 'to' && !evaluateTakeoffRunwayAvailability(airport).available) {
          refreshRunwaySuggestionSelection(prefix);
          return;
        }
        if (!applySuggestedRunway(suggestion.runway, airport.Intersection || '', prefix)) return;
        const currentSelection = AppState.airportSelection[prefix];
        const intersectionLabel = currentSelection.intersection
          ? `, intersection ${currentSelection.intersection}`
          : '';
        updateRunwaySuggestion(
          prefix,
          `RWY ${suggestion.runway}${intersectionLabel} selected for ${prefix === 'to' ? 'take-off' : 'landing'}.`,
          suggestion
        );
      });
      option.appendChild(selectButton);
      optionsContainer.appendChild(option);
    });
  }
}

export function refreshRunwaySuggestionSelection(prefix) {
  const suggestion = AppState.runwaySuggestions[prefix];
  if (!suggestion) return;
  updateRunwaySuggestion(
    prefix,
    `METAR suggests RWY ${suggestion.runway} (${Math.round(suggestion.headwind)} kt headwind). Verify before use.`,
    suggestion
  );
}

export function scheduleTakeoffSuggestionRefresh() {
  if (!AppState.runwaySuggestions.to) return;
  window.clearTimeout(AppState.runwaySuggestionRefreshTimer);
  AppState.runwaySuggestionRefreshTimer = window.setTimeout(() => {
    AppState.runwaySuggestionRefreshTimer = null;
    refreshRunwaySuggestionSelection('to');
  }, 150);
}

export function suggestRunwayFromMetar(metarText, prefix) {
  const { wind } = MetarWeather.parse(metarText);
  if (!wind || wind.directionDegrees === null) {
    updateRunwaySuggestion(prefix, 'No runway suggestion: METAR wind direction is variable or unavailable.');
    return;
  }

  const direction = wind.directionDegrees;
  const speedKnots = wind.speedKnots;
  if (!Number.isFinite(direction) || direction > 360 ||
      !Number.isFinite(speedKnots) || speedKnots === 0) {
    updateRunwaySuggestion(prefix, 'No runway suggestion: METAR wind is calm or has an invalid direction.');
    return;
  }

  const runwayCandidates = new Map();
  const runwaysByName = new Map();
  getAirportRows(AppState.airportSelection[prefix].icao).forEach((airport) => {
    if (!runwaysByName.has(airport.RWY)) runwaysByName.set(airport.RWY, []);
    runwaysByName.get(airport.RWY).push(airport);
  });
  runwaysByName.forEach((airportRows, runway) => {
    if (!runwayAvailableForPage(AppState.airportSelection[prefix].icao, runway, prefix)) return;
    const headings = [...new Set(airportRows
      .map((airport) => airport['RWYHDG [°](H6)'])
      .filter((value) => value !== null && value !== undefined && String(value).trim() !== '')
      .map((value) => Number(value))
      .filter((heading) => Number.isFinite(heading) && heading >= 0 && heading <= 360)
      .map((heading) => heading % 360))];
    if (headings.length !== 1) return;
    const heading = headings[0];
    const relativeWind = ((direction - heading + 540) % 360) - 180;
    const headwind = speedKnots * Math.cos(relativeWind * Math.PI / 180);
    runwayCandidates.set(runway, { runway, headwind });
  });

  const candidates = [...runwayCandidates.values()].sort((left, right) => right.headwind - left.headwind);
  // Ignore floating-point noise around a pure crosswind. A runway suggestion
  // must have a meaningful positive headwind component, not a rounded 0 kt.
  if (candidates.length === 0 || candidates[0].headwind <= 0.1) {
    updateRunwaySuggestion(prefix, 'No runway has a headwind component; select a runway manually.');
    return;
  }

  if (candidates.length > 1 && Math.abs(candidates[0].headwind - candidates[1].headwind) < 0.1) {
    updateRunwaySuggestion(prefix, 'Runways have similar headwind components; select a runway manually.');
    return;
  }

  const suggestion = candidates[0];
  updateRunwaySuggestion(
    prefix,
    `METAR suggests RWY ${suggestion.runway} (${Math.round(suggestion.headwind)} kt headwind). Verify before use.`,
    suggestion
  );
}

export function applySuggestedRunway(runway, intersection, pagePrefix = 'to') {
  const suggestion = AppState.runwaySuggestions[pagePrefix];
  if (!suggestion || suggestion.runway !== runway) return false;
  const selection = AppState.airportSelection[pagePrefix];
  selection.runway = runway;
  if (pagePrefix === 'ldg') {
    const airport = getLandingAirportRecord(selection.icao, runway);
    selection.intersection = airport && airport.Intersection ? airport.Intersection : '';
  } else {
    selection.intersection = intersection;
  }
  persistAirportSelection(pagePrefix);
  syncAirportControls();
  updateCustomAirportData(getSelectedAirportRecord(pagePrefix), pagePrefix);
  return true;
}

export function getAirportIcaoCodes() {
  ensureAirportIndex();
  return airportIcaoCodes;
}

export function hideAirportIcaoSuggestions(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const suggestions = document.getElementById(input.getAttribute('aria-controls'));
  if (!suggestions) return;
  suggestions.hidden = true;
  input.setAttribute('aria-expanded', 'false');
  input.removeAttribute('aria-activedescendant');
}

export function showAirportIcaoSuggestions(value, inputId) {
  const input = document.getElementById(inputId);
  const suggestions = document.getElementById(input.getAttribute('aria-controls'));
  if (!suggestions) return;

  const query = value.trim().toUpperCase();
  const codes = getAirportIcaoCodes();
  const matches = [];
  if (query && !getAirportRows(query).length) {
    for (const icao of codes) {
      if (icao.startsWith(query)) {
        matches.push(icao);
        if (matches.length === 8) break;
      }
    }
  }

  suggestions.replaceChildren();
  input.removeAttribute('aria-activedescendant');
  matches.forEach((icao, index) => {
    const option = document.createElement('button');
    option.type = 'button';
    option.id = `${inputId}-suggestion-${index}`;
    option.className = 'icao-suggestion';
    option.setAttribute('role', 'option');
    option.setAttribute('aria-selected', 'false');
    option.textContent = icao;
    option.addEventListener('mousedown', (event) => event.preventDefault());
    option.addEventListener('click', () => {
      hideAirportIcaoSuggestions(inputId);
      handleAirportIcaoInput(icao, inputId.startsWith('ldg-') ? 'ldg' : 'to');
      input.focus();
    });
    suggestions.appendChild(option);
  });

  suggestions.hidden = matches.length === 0;
  input.setAttribute('aria-expanded', String(matches.length > 0));
}

export function handleAirportIcaoKeydown(event, inputId) {
  const input = document.getElementById(inputId);
  const suggestions = document.getElementById(input.getAttribute('aria-controls'));
  if (!suggestions || suggestions.hidden) {
    if (event.key === 'Escape') hideAirportIcaoSuggestions(inputId);
    return;
  }

  const options = [...suggestions.querySelectorAll('[role="option"]')];
  const activeIndex = options.findIndex((option) => option.getAttribute('aria-selected') === 'true');
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    const direction = event.key === 'ArrowDown' ? 1 : -1;
    const nextIndex = activeIndex < 0
      ? (direction === 1 ? 0 : options.length - 1)
      : (activeIndex + direction + options.length) % options.length;
    options.forEach((option, index) =>
      option.setAttribute('aria-selected', String(index === nextIndex))
    );
    input.setAttribute('aria-activedescendant', options[nextIndex].id);
  } else if (event.key === 'Enter' && (activeIndex >= 0 || options.length === 1)) {
    event.preventDefault();
    options[activeIndex >= 0 ? activeIndex : 0].click();
  } else if (event.key === 'Escape') {
    hideAirportIcaoSuggestions(inputId);
  }
}

export function persistAirportSelection(prefix) {
  const selection = AppState.airportSelection[prefix];
  localStorage.setItem(`selected_${prefix}_airport_icao`, selection.icao);
  localStorage.setItem(`selected_${prefix}_airport_runway`, selection.runway);
  localStorage.setItem(`selected_${prefix}_airport_intersection`, selection.intersection);
}

export function showAirportSelectionError(message) {
  const errorElement = document.getElementById('airport-selection-error');
  if (!errorElement) return;
  errorElement.textContent = message;
  errorElement.hidden = !message;
}

export function airportCellValue(value) {
  if (value === null || value === undefined || String(value).trim() === '') return null;
  const text = String(value).trim();
  const number = Number(text);
  return Number.isFinite(number) ? number : text;
}

// Airport column "Engine out climb path": "Straight" or "Turning". Missing data is treated as
// turning (up to 15° bank), which applies the conservative AFM weight/gradient correction.
export function getC56xEngineOutClimbPath(airport) {
  const key = airport
    ? Object.keys(airport).find((name) => /^engine out climb path/i.test(name.trim()))
    : null;
  const value = key ? String(airport[key] ?? '').trim().toLowerCase() : '';
  if (value === 'straight') return { turning: false, label: 'Straight out', assumed: false };
  if (value === 'turning') return { turning: true, label: 'Turning climb (up to 15° bank)', assumed: false };
  return { turning: true, label: 'Turning climb (no airport data)', assumed: true };
}

export function updateClimbPathLabel(climbPath) {
  const element = document.getElementById('res-to-climb-path');
  if (!element) return;
  element.textContent = climbPath ? `Climb path: ${climbPath.label}` : '';
  element.style.color = climbPath?.assumed ? '#9a8a63' : '#6e7681';
}

export function getAirportLookupCellValue(airport, prefix, dataField, cellRef) {
  let value = airport ? airportCellValue(airport[dataField]) : null;
  if (prefix === 'to' && ['C19', 'C20', 'C21'].includes(cellRef) &&
      typeof value === 'number') {
    value -= 10;
  }
  return value;
}

export function updateTakeoffAirportElevation(airport) {
  const elevationElement = document.getElementById('to-airport-elevation');
  if (!elevationElement) return null;

  const elevation = airportCellValue(airport?.['RWY Elev [ft] (B6)']);
  elevationElement.textContent = typeof elevation === 'number'
    ? Math.round(elevation).toLocaleString('en-US')
    : '-';
  return elevation;
}

export function evaluateTakeoffRunwayAvailability(airport) {
  if (isC56xSelected()) {
    return { available: true, reasons: [] };
  }
  if (!AppState.hfInstance) {
    return { available: false, reasons: ['Performance calculator unavailable'] };
  }

  const requiredFields = Object.keys(CELL_MAPPING.airport.inputs).filter((field) =>
    !OPTIONAL_AIRPORT_DATA_FIELDS.includes(field)
  );
  if (requiredFields.some((field) => airportCellValue(airport[field]) === null)) {
    return { available: false, reasons: ['Airport data incomplete'] };
  }

  const config = CELL_MAPPING.takeoff;
  const sheet = AppState.hfInstance.getSheetId(config.sheetName);
  const candidateValues = new Map([[config.inputs.airportAndRwy, 'Custom airport']]);
  Object.entries(AIRPORT_LOOKUP_CELLS_BY_PAGE.to).forEach(([dataField, cellRef]) => {
    candidateValues.set(
      cellRef,
      getAirportLookupCellValue(airport, 'to', dataField, cellRef)
    );
  });

  const savedCells = [...candidateValues].map(([cellRef]) => {
    const position = parseCellRef(cellRef);
    if (!position) throw new Error(`Invalid takeoff airport lookup cell reference: ${cellRef}`);
    return {
      cellRef,
      position,
      value: AppState.hfInstance.getCellSerialized({ sheet, col: position.col, row: position.row }) ?? null,
    };
  });

  try {
    const candidateWrites = [...candidateValues].map(([, value], index) => ({
      position: savedCells[index].position,
      value,
    }));
    setWorkbookCellValues(sheet, candidateWrites);

    const distanceChecks = [
      { label: 'TOR', limitName: 'TORA', output: getTakeoffOutput('tor', false), limit: getOutputVal(config.sheetName, 'C20', false) },
      { label: 'TOD', limitName: 'TODA', output: getTakeoffOutput('tod', false), limit: getOutputVal(config.sheetName, 'C21', false) },
      { label: 'ASD', limitName: 'ASDA', output: getTakeoffOutput('asd', false), limit: getOutputVal(config.sheetName, 'C19', false) },
    ];
    const reasons = distanceChecks.flatMap((check) => {
      const result = exceedsDistanceLimit(check.output, check.limit);
      if (result === null) return [`${check.label}/${check.limitName} performance unavailable`];
      return result ? [`${check.label} exceeds ${check.limitName}`] : [];
    });

    const actualClimbGradient = finiteDistance(
      getTakeoffOutput('climbGrad', false)
    );
    const requiredClimbGradient = finiteDistance(
      getOutputVal(config.sheetName, config.outputs.req_climb_grad_to, false)
    );
    if (actualClimbGradient === null || requiredClimbGradient === null) {
      reasons.push('OEI climb gradient unavailable');
    } else if (actualClimbGradient < requiredClimbGradient) {
      reasons.push('OEI climb gradient below minimum');
    }

    return { available: reasons.length === 0, reasons };
  } catch (error) {
    console.error(`Could not evaluate takeoff performance for runway ${airport.RWY}:`, error);
    return { available: false, reasons: ['Performance check unavailable'] };
  } finally {
    setWorkbookCellValues(sheet, savedCells);
  }
}

export function updateCustomAirportData(airport, prefix) {
  if (prefix === 'to') updateTakeoffAirportElevation(airport);
  updateOeiRoutingWarning();
  if (!AppState.hfInstance) {
    if (isC56xSelected()) {
      updateMaxTakeoffMass();
      updateC56xTakeoffFieldLength();
      updateC56xLanding();
    }
    return;
  }

  try {
    const sheetType = prefix === 'to' ? 'takeoff' : 'landing';
    const config = CELL_MAPPING[sheetType];
    const sheet = AppState.hfInstance.getSheetId(config.sheetName);
    const airportKeyPosition = parseCellRef(config.inputs.airportAndRwy);
    if (!airportKeyPosition) throw new Error(`Invalid ${sheetType} airport cell reference.`);
    AppState.hfInstance.batch(() => {
      AppState.hfInstance.setCellContents(
        { sheet, col: airportKeyPosition.col, row: airportKeyPosition.row },
        [[airport ? 'Custom airport' : '']]
      );

      Object.entries(AIRPORT_LOOKUP_CELLS_BY_PAGE[prefix]).forEach(([dataField, cellRef]) => {
        const position = parseCellRef(cellRef);
        if (!position) throw new Error(`Invalid ${prefix} airport lookup cell reference: ${cellRef}`);
        const value = getAirportLookupCellValue(airport, prefix, dataField, cellRef);
        AppState.hfInstance.setCellContents(
          { sheet, col: position.col, row: position.row },
          [[value]]
        );
      });
    });

    const requiredFields = prefix === 'to'
      ? Object.keys(CELL_MAPPING.airport.inputs).filter((field) =>
        !OPTIONAL_AIRPORT_DATA_FIELDS.includes(field)
      )
      : Object.keys(AIRPORT_LOOKUP_CELLS_BY_PAGE.ldg);
    const missingFields = airport
      ? requiredFields.filter((dataField) => airportCellValue(airport[dataField]) === null
      )
      : [];
    showAirportSelectionError(
      missingFields.length
        ? `Airport data is missing required values: ${missingFields.join(', ')}.`
        : ''
    );
    refreshOutputs();
    return true;
  } catch (error) {
    console.error('Could not update custom airport data in the workbook:', error);
    showAirportSelectionError('Could not update custom airport data in the workbook.');
    return false;
  }
}

function updateOeiRoutingWarning() {
  const warning = document.getElementById('to-oei-routing-warning');
  if (!warning) return;
  const runway = getSelectedAirportRecord('to');
  const routing = airportCellValue(runway?.['Routing(L6)']);
  const requiredGradient = airportCellValue(runway?.['min climb gradient OEI(I6)']);
  const routingIsEmpty = routing == null || String(routing).trim() === '' || String(routing).trim() === '-';
  const requiredGradientMissing = typeof requiredGradient !== 'number';
  warning.hidden = !(
    runway && (requiredGradientMissing || (routingIsEmpty && requiredGradient === 3.3))
  );
}

export function handleAirportIcaoInput(value, prefix = 'to') {
  const icao = value.trim().toUpperCase();
  const selection = AppState.airportSelection[prefix];
  if (icao === selection.icao) {
    syncAirportControls();
    showAirportIcaoSuggestions(icao, document.activeElement.id);
    return;
  }

  const hadAirportData = Boolean(selection.runway);
  selection.icao = icao;
  selection.runway = '';
  selection.intersection = '';
  persistAirportSelection(prefix);
  syncAirportControls();
  const inputId = document.activeElement.id;
  if (inputId === 'to-airport-icao' || inputId === 'ldg-airport-icao') {
    showAirportIcaoSuggestions(icao, inputId);
  }
  clearAirportMetar(prefix);
  restoreSavedMetar(prefix);
  updateRunwaySuggestion(prefix, '');
  // Only recalculate the workbook when airport data actually has to be cleared
  if (hadAirportData || icao === '') updateCustomAirportData(null, prefix);

  const airportExists = /^[A-Z0-9]{4}$/.test(icao) && getAirportRows(icao).length > 0;
  if (/^[A-Z0-9]{4}$/.test(icao) && !airportExists) {
    showAirportSelectionError(`ICAO ${icao} was not found in the ${isCustomAirportEnabled() ? 'custom airport list' : 'airport database'}.`);
  } else if (airportExists) {
    fetchMetarForAirport(prefix);
  }
}

export function handleAirportRunwayChange(runway, prefix = 'to') {
  const selection = AppState.airportSelection[prefix];
  selection.runway = runway;
  selection.intersection = '';
  persistAirportSelection(prefix);
  syncAirportControls();

  const airport = getSelectedAirportRecord(prefix);
  updateCustomAirportData(airport, prefix);
  refreshRunwaySuggestionSelection(prefix);
}

export function handleLandingAirportRunwayChange(runway, prefix = 'ldg') {
  const selection = AppState.airportSelection[prefix];
  selection.runway = runway;
  const airport = getLandingAirportRecord(selection.icao, runway);
  selection.intersection = airport && airport.Intersection ? airport.Intersection : '';
  persistAirportSelection(prefix);
  syncAirportControls();
  updateCustomAirportData(airport, prefix);
  refreshRunwaySuggestionSelection(prefix);
}

export function handleAirportIntersectionChange(intersection, prefix = 'to') {
  AppState.airportSelection[prefix].intersection = intersection;
  persistAirportSelection(prefix);
  syncAirportControls();

  const airport = getSelectedAirportRecord(prefix);
  updateCustomAirportData(airport, prefix);
  refreshRunwaySuggestionSelection(prefix);
}
