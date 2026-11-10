import { getAirportRows, getRunwayRows, getSelectedAirportRecord, syncAirportControls, updateCustomAirportData } from './airport-ui.js';
import { AIRCRAFT_REGISTRATIONS, AIRPORT_CONTROL_IDS, AppState, CELL_MAPPING, getPersistedFormStateKey } from './app-state.js';
import { MetarWeather } from './metar-weather.js';
import { setMetarWeatherStatus } from './results-ui.js';
import { parseCellRef } from './workbook-adapter.js';


// Workbook loading, persistence, and formula import

export async function loadData(registration) {
  console.log("1. loadData har startat!");
  try {
    const aircraft = AIRCRAFT_REGISTRATIONS[registration];
    if (aircraft?.performanceEngine !== 'workbook') {
      throw new Error(`The workbook engine is not configured for ${registration}.`);
    }
    const workbookName = aircraft.workbook;
    if (typeof workbookName !== 'string' || !workbookName.trim()) {
      throw new Error(`No performancedata is available for the registration ${registration}.`);
    }

    const basePath = getDataFilePath(workbookName);

    console.log("2. Försöker hämta fil från:", basePath);
    const response = await fetch(basePath);
    console.log("3. Fetch klar, status:", response.status);

    if (!response.ok) throw new Error(`Kunde inte hämta filen (${response.statusText})`);

    const arrayBuffer = await response.arrayBuffer();
    console.log("4. ArrayBuffer inläst, läser med XLSX...");

    const workbook = XLSX.read(arrayBuffer, { type: 'array', cellFormula: true, cellValue: true });
    console.log("5. Workbook klar, bearbetar blad...");

    const sheetsData = {};
    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      sheetsData[sheetName] = worksheetToHyperFormulaData(worksheet);
    });

    AppState.hfInstance = HyperFormula.buildFromSheets(sheetsData, { licenseKey: 'gpl-v3' });
    const landingConfig = CELL_MAPPING.landing;
    const landingSheet = AppState.hfInstance.getSheetId(landingConfig.sheetName);
    const landingLdaPosition = parseCellRef(landingConfig.outputs.lda);
    if (!landingLdaPosition) throw new Error('Invalid landing LDA cell reference.');
    AppState.hfInstance.setCellContents(
      { sheet: landingSheet, col: landingLdaPosition.col, row: landingLdaPosition.row },
      [["='Airport data'!F6"]]
    );
    console.log("6. HyperFormula-instans skapad!");

    console.log(`${workbookName} har lästs in i HyperFormula!`);

    return sheetsData;
  } catch (error) {
    console.error("Fel vid inläsning av Excel-fil:", error);
    throw error;
  }
}

export function getDataFilePath(fileName) {
  return window.location.hostname.includes('github.io')
    ? `/Beechcraft-Performance-EFB/data/${fileName}`
    : `data/${fileName}`;
}

let c56xPerformanceDataPromise;

export async function loadC56xPerformanceData() {
  if (typeof getC56xMaxTakeoffWeight === 'function') return;

  if (!c56xPerformanceDataPromise) {
    c56xPerformanceDataPromise = (async () => {
      const script = document.createElement('script');
      script.src = getDataFilePath('c56x/index.js');
      await new Promise((resolve, reject) => {
        script.addEventListener('load', resolve, { once: true });
        script.addEventListener('error', () => {
          reject(new Error('Could not load C56X performance data loader.'));
        }, { once: true });
        document.head.appendChild(script);
      });
      await window.C56XPerformanceDataReady;
      if (typeof getC56xMaxTakeoffWeight !== 'function') {
        throw new Error('C56X performance data did not expose the MTOW calculator.');
      }
    })();
  }

  return c56xPerformanceDataPromise;
}

export const CUSTOM_AIRPORT_ENABLED_KEY = 'custom_airport_enabled';
export const CUSTOM_AIRPORTS_KEY = 'custom_airports';

export function isCustomAirportEnabled() {
  return localStorage.getItem(CUSTOM_AIRPORT_ENABLED_KEY) === 'true';
}

export function loadCustomAirports() {
  try {
    const rows = JSON.parse(localStorage.getItem(CUSTOM_AIRPORTS_KEY) || '[]');
    return Array.isArray(rows)
      ? rows.filter((row) => row && /^[A-Z0-9]{4}$/.test(row.ICAO) && String(row.RWY || '').trim())
      : [];
  } catch {
    return [];
  }
}

export function saveCustomAirports(rows) {
  localStorage.setItem(CUSTOM_AIRPORTS_KEY, JSON.stringify(rows));
}

export async function loadAirportDatabase() {
  if (isCustomAirportEnabled()) return loadCustomAirports();

  const response = await fetch(getDataFilePath('airports.json'));
  if (!response.ok) {
    throw new Error(`Could not load airport database (${response.status} ${response.statusText}).`);
  }

  const airportData = await response.json();
  if (!airportData || !Array.isArray(airportData.Sheet1) || airportData.Sheet1.length === 0 ||
      airportData.Sheet1.some((airport) =>
        !airport || typeof airport.ICAO !== 'string' || !/^[A-Z0-9]{4}$/.test(airport.ICAO) ||
        typeof airport.RWY !== 'string' || airport.RWY.trim() === ''
      )) {
    throw new Error('Airport database has an invalid format.');
  }

  return airportData.Sheet1;
}

// 3. Dummy för eventlyssnare så den inte kraschar
export function setupEventListeners() {
  const persistFormChange = (event) => {
    const control = event.target;
    if (!(control instanceof HTMLInputElement || control instanceof HTMLSelectElement) ||
        !control.id || !control.closest('main') || AIRPORT_CONTROL_IDS.has(control.id)) return;
    persistFormState();
  };
  document.addEventListener('input', persistFormChange);
  document.addEventListener('change', persistFormChange);
}

export function getPersistedFormState() {
  const savedState = localStorage.getItem(getPersistedFormStateKey());
  if (!savedState) return {};

  try {
    const parsedState = JSON.parse(savedState);
    return parsedState && typeof parsedState === 'object' && !Array.isArray(parsedState)
      ? parsedState
      : {};
  } catch (error) {
    console.warn('Could not read saved performance inputs:', error);
    return {};
  }
}

export function persistFormState() {
  const formState = {};
  document.querySelectorAll('main input[id], main select[id]').forEach((control) => {
    if (AIRPORT_CONTROL_IDS.has(control.id)) return;
    formState[control.id] = control instanceof HTMLInputElement && control.type === 'checkbox'
      ? String(control.checked)
      : control.value;
  });
  localStorage.setItem(getPersistedFormStateKey(), JSON.stringify(formState));
}

export function restorePersistedFormState() {
  const formState = getPersistedFormState();
  document.querySelectorAll('main input[id], main select[id]').forEach((control) => {
    if (AIRPORT_CONTROL_IDS.has(control.id) ||
        !Object.prototype.hasOwnProperty.call(formState, control.id) ||
        typeof formState[control.id] !== 'string') return;

    const savedValue = formState[control.id];
    if (control instanceof HTMLSelectElement &&
        ![...control.options].some((option) => option.value === savedValue)) return;

    const isCheckbox = control instanceof HTMLInputElement && control.type === 'checkbox';
    if (isCheckbox) {
      control.checked = savedValue === 'true';
    } else {
      control.value = savedValue;
    }
    control.dispatchEvent(new Event(
      control instanceof HTMLSelectElement || isCheckbox ? 'change' : 'input',
      { bubbles: true }
    ));
  });
  return formState;
}

export function metarStorageKey(prefix, icao) {
  return `saved_metar_${prefix}_${icao}`;
}

export function saveMetar(prefix, icao, metar) {
  localStorage.setItem(metarStorageKey(prefix, icao), JSON.stringify({
    text: metar.text,
    ageMinutes: metar.ageMinutes,
    savedAt: Date.now(),
  }));
}

export function restoreSavedMetar(prefix) {
  const icao = AppState.airportSelection[prefix].icao;
  if (!/^[A-Z0-9]{4}$/.test(icao) || !getAirportRows(icao).length) return;

  const savedMetar = localStorage.getItem(metarStorageKey(prefix, icao));
  if (!savedMetar) return;

  try {
    const metar = JSON.parse(savedMetar);
    if (typeof metar.text !== 'string' || !Number.isFinite(metar.ageMinutes) ||
        !Number.isFinite(metar.savedAt)) {
      throw new Error('Saved METAR has an invalid format.');
    }

    const ageMinutes = metar.ageMinutes + (Date.now() - metar.savedAt) / 60000;
    const displaySpan = document.getElementById(`${prefix}-metar-display`);
    if (!displaySpan) return;
    displaySpan.textContent = metar.text;
    displaySpan.style.color = ageMinutes >= 60 ? '#f85149'
      : ageMinutes >= 35 ? '#d29922'
        : '#3fb950';
    if (MetarWeather.parse(metar.text).windUnit === 'MPS') {
      setMetarWeatherStatus(prefix, 'METAR wind is in m/s; weather fields were left unchanged. Enter wind manually in kt.');
    }
  } catch (error) {
    console.warn(`Could not restore saved METAR for ${icao}:`, error);
  }
}

export function populateAirportSelects() {
  ['to', 'ldg'].forEach((prefix) => {
    const selection = AppState.airportSelection[prefix];
    const legacyIcao = localStorage.getItem('selected_airport_icao') || '';
    const savedIcao = localStorage.getItem(`selected_${prefix}_airport_icao`);
    const savedRunway = localStorage.getItem(`selected_${prefix}_airport_runway`);
    const savedIntersection = localStorage.getItem(`selected_${prefix}_airport_intersection`);
    selection.icao = (savedIcao === null
      ? legacyIcao
      : savedIcao).toUpperCase();
    selection.runway = savedRunway === null
      ? (localStorage.getItem('selected_airport_runway') || '')
      : savedRunway;
    selection.intersection = savedIntersection === null
      ? (localStorage.getItem('selected_airport_intersection') || '')
      : savedIntersection;

    const runwayRows = getRunwayRows(selection.icao, selection.runway);
    if (!getAirportRows(selection.icao).length || !runwayRows.length) {
      selection.icao = '';
      selection.runway = '';
      selection.intersection = '';
    } else if (!runwayRows.some((airport) => !airport.Intersection) &&
        !runwayRows.some((airport) => airport.Intersection === selection.intersection)) {
      selection.intersection = runwayRows[0].Intersection || '';
    }
  });

  syncAirportControls();
  ['to', 'ldg'].forEach((prefix) =>
    updateCustomAirportData(getSelectedAirportRecord(prefix), prefix)
  );
  ['to', 'ldg'].forEach(restoreSavedMetar);
}

// Convert a SheetJS worksheet without losing formulas
export function worksheetToHyperFormulaData(worksheet) {
  if (!worksheet || !worksheet['!ref']) return [];

  const range = XLSX.utils.decode_range(worksheet['!ref']);
  const rows = Array.from(
    { length: range.e.r + 1 },
    () => Array(range.e.c + 1).fill(null)
  );

  Object.keys(worksheet).forEach(cellRef => {
    if (cellRef.startsWith('!')) return;

    const cell = worksheet[cellRef];
    const position = XLSX.utils.decode_cell(cellRef);

    if (cell.f && (
      cell.f.includes('_xlfn.') ||
      cell.f.includes('__xludf.DUMMYFUNCTION')
    )) {
      rows[position.r][position.c] = cell.v ?? null;
    } else if (cell.f) {
      const formula = normalizeFormulaForHyperFormula(cell.f);
      rows[position.r][position.c] = `=${formula}`;
    } else if (cell.t === 'e') {
      rows[position.r][position.c] = cell.w || null;
    } else {
      rows[position.r][position.c] = cell.v ?? null;
    }
  });

  return rows;
}

export function normalizeFormulaForHyperFormula(formula) {
  const normalizedBooleans = formula.replace(
    /\b(TRUE|FALSE)\b(?!\s*\()/gi,
    '$1()'
  );
  return normalizeHorizontalIndexCalls(normalizedBooleans);
}

export function normalizeHorizontalIndexCalls(formula) {
  let result = '';
  let index = 0;

  while (index < formula.length) {
    const char = formula[index];

    if (char === '"' || char === "'") {
      const quoteEnd = findFormulaQuoteEnd(formula, index, char);
      result += formula.slice(index, quoteEnd);
      index = quoteEnd;
      continue;
    }

    const isIndexCall = formula.slice(index, index + 5).toUpperCase() === 'INDEX'
      && !isFormulaIdentifierCharacter(formula[index - 1]);

    if (isIndexCall) {
      let openParen = index + 5;
      while (/\s/.test(formula[openParen] || '')) openParen += 1;

      if (formula[openParen] === '(') {
        const closeParen = findMatchingFormulaParen(formula, openParen);

        if (closeParen !== -1) {
          const originalArguments = formula.slice(openParen + 1, closeParen);
          const normalizedArguments = normalizeHorizontalIndexCalls(originalArguments);
          const args = splitFormulaArguments(normalizedArguments);
          const rewrittenArguments = args.length === 2 && isSingleRowRange(args[0])
            ? `${args[0]},1,${args[1]}`
            : normalizedArguments;

          result += formula.slice(index, openParen + 1);
          result += rewrittenArguments;
          result += ')';
          index = closeParen + 1;
          continue;
        }
      }
    }

    result += char;
    index += 1;
  }

  return result;
}

export function findFormulaQuoteEnd(formula, start, quote) {
  let index = start + 1;
  while (index < formula.length) {
    if (formula[index] === quote) {
      if (formula[index + 1] === quote) {
        index += 2;
        continue;
      }
      return index + 1;
    }
    index += 1;
  }
  return formula.length;
}

export function findMatchingFormulaParen(formula, openParen) {
  let depth = 0;
  for (let index = openParen; index < formula.length; index += 1) {
    const char = formula[index];
    if (char === '"' || char === "'") {
      index = findFormulaQuoteEnd(formula, index, char) - 1;
    } else if (char === '(') {
      depth += 1;
    } else if (char === ')') {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return -1;
}

export function splitFormulaArguments(argumentsText) {
  const args = [];
  let depth = 0;
  let argumentStart = 0;

  for (let index = 0; index < argumentsText.length; index += 1) {
    const char = argumentsText[index];
    if (char === '"' || char === "'") {
      index = findFormulaQuoteEnd(argumentsText, index, char) - 1;
    } else if (char === '(') {
      depth += 1;
    } else if (char === ')') {
      depth -= 1;
    } else if (char === ',' && depth === 0) {
      args.push(argumentsText.slice(argumentStart, index));
      argumentStart = index + 1;
    }
  }
  args.push(argumentsText.slice(argumentStart));
  return args;
}

export function isSingleRowRange(expression) {
  const compactExpression = expression.replace(/\s+/g, '');
  const rangeMatch = compactExpression.match(
    /^(?:(?:'(?:[^']|'')+'|[A-Z_][A-Z0-9_.]*)!)?\$?[A-Z]{1,3}\$?(\d+):\$?[A-Z]{1,3}\$?(\d+)$/i
  );
  return Boolean(rangeMatch && rangeMatch[1] === rangeMatch[2]);
}

export function isFormulaIdentifierCharacter(char) {
  return Boolean(char && /[A-Z0-9_.]/i.test(char));
}

// Byt mellan flikar
