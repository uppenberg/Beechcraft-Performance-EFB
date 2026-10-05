let hfInstance;
let globalData = { airports: [], factors: {} };
let airportSelection = { icao: '', runway: '', intersection: '' };
let runwaySuggestion = null;
let appServiceWorkerRegistration = null;
let reloadAfterServiceWorkerChange = false;

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
      'min cloudbase(K6)': 'K6',
      'Routing(L6)': 'L6',
    }
  },
  takeoff: {
    sheetName: 'Take-off',
    inputs: {
      'to-metar': 'C5',
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
    },
    outputs: {
      asda: 'C19',
      tora: 'C20',
      toda: 'C21',
      tor: 'F21',
      hwTw: 'C24',
      xw: 'C25',
      xwLimit: 'F25',
      g19: 'G19',
      tod: 'C36',
      asd: 'C37',
      v1: 'C38',
      vr: 'C39',
      v2: 'C40',
      climbGrad: 'C42',
      emUpVref: 'C45',
      emUpDist: 'C46',
      emDownVref: 'G45',
      emDownDist: 'G46',
      cloudBase: 'C69',
      escapeRoute: 'C70',
    }
  },
  landing: {
    sheetName: 'Landing',
    inputs: {
      'ldg-metar': 'C5',
      airportAndRwy: 'C4',
      rwcc: 'C10',
      mass: 'C11',
      flaps: 'G24',
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
const OPTIONAL_AIRPORT_DATA_FIELDS = ['min cloudbase(K6)', 'Routing(L6)'];

const WORKBOOK_BY_REGISTRATION = {
  'SE-LTL': 'se-ltl.xlsx'
};

function showRegistrationError(message) {
  const errorElement = document.getElementById('registration-error');
  if (!errorElement) return;
  errorElement.textContent = message;
  errorElement.hidden = false;
}

function clearRegistrationError() {
  const errorElement = document.getElementById('registration-error');
  if (!errorElement) return;
  errorElement.textContent = '';
  errorElement.hidden = true;
}

function handleRegistrationChange(registration) {
  const registrationSelect = document.getElementById('global-registration');
  if (!registrationSelect) return;

  if (!WORKBOOK_BY_REGISTRATION[registration]) {
    registrationSelect.value = 'SE-LTL';
    showRegistrationError(`No performancedata is available for ${registration}. `);
    return;
  }

  localStorage.setItem('selected_reg', registration);
  clearRegistrationError();
  window.location.reload();
}

// 1. Huvudfunktion som kör igång allt i rätt ordning
async function init() {
  try {
    const versionElement = document.getElementById('app-version');
    if (versionElement) versionElement.textContent = `v${window.APP_VERSION}`;

    console.log("Startar PWA och laddar data...");

    const registrationSelect = document.getElementById('global-registration');
    if (registrationSelect && !WORKBOOK_BY_REGISTRATION[registrationSelect.value]) {
      const unsupportedRegistration = registrationSelect.value;
      registrationSelect.value = 'SE-LTL';
      localStorage.setItem('selected_reg', 'SE-LTL');
      showRegistrationError(`No performancedata is available for ${unsupportedRegistration}. `);
    }
    
    // Ladda in Excel och skapa HyperFormula-instansen
    await loadData(registrationSelect?.value || 'SE-LTL');
    globalData.airports = await loadAirportDatabase();
    
    // Fyll rullistor och koppla eventlyssnare
    populateAirportSelects();
    setupEventListeners();
    if (getAirportRows(airportSelection.icao).length) {
      fetchMetarForAirport();
    }
    const antiIceSelect = document.getElementById('to-anti-ice');
    if (antiIceSelect) {
      updateEngineCellVal('takeoff', 'antiIce', antiIceSelect.value);
    }
    
    setupSettingsMenu();
    registerAppServiceWorker();
    
    console.log("Appen är helt initierad!");
  } catch (error) {
    console.error("Kunde inte slutföra init():", error);
    showAirportSelectionError(`Could not initialize the performance calculator: ${error.message}`);
  }
}

function setupSettingsMenu() {
  const toggle = document.getElementById('settings-toggle');
  const panel = document.getElementById('settings-panel');
  const updateButton = document.getElementById('check-updates-button');

  if (!toggle || !panel || !updateButton) return;

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!isOpen));
    panel.hidden = isOpen;
  });

  document.addEventListener('click', (event) => {
    if (!panel.hidden && !event.target.closest('.settings-menu')) {
      panel.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !panel.hidden) {
      panel.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      toggle.focus();
    }
  });

  updateButton.addEventListener('click', checkForAppUpdate);
}

function setUpdateStatus(message) {
  const status = document.getElementById('update-status');
  if (status) status.textContent = message;
}

function setUpdateAvailable(isAvailable) {
  const toggle = document.getElementById('settings-toggle');
  const updateButton = document.getElementById('check-updates-button');
  if (!toggle || !updateButton) return;

  toggle.classList.toggle('update-available', isAvailable);
  toggle.setAttribute('aria-label', isAvailable ? 'Open settings, update available' : 'Open settings');
  updateButton.textContent = isAvailable ? 'Update available — install' : 'Check for updates';
  if (isAvailable) setUpdateStatus('A new app version is ready to install.');
}

function watchForServiceWorkerUpdate(registration) {
  registration.addEventListener('updatefound', () => {
    const installingWorker = registration.installing;
    if (!installingWorker) return;

    installingWorker.addEventListener('statechange', () => {
      if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
        setUpdateAvailable(true);
      } else if (installingWorker.state === 'redundant') {
        setUpdateStatus('The update could not be installed. Check your connection and try again.');
      }
    });
  });
}

async function registerAppServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    setUpdateStatus('App updates are not supported in this browser.');
    return;
  }

  try {
    appServiceWorkerRegistration = await navigator.serviceWorker.register('./sw.js', {
      updateViaCache: 'none'
    });

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloadAfterServiceWorkerChange) window.location.reload();
    });

    watchForServiceWorkerUpdate(appServiceWorkerRegistration);

    if (appServiceWorkerRegistration.waiting && navigator.serviceWorker.controller) {
      setUpdateAvailable(true);
    } else {
      setUpdateStatus('Checking for app updates…');
    }

    await appServiceWorkerRegistration.update();
    if (appServiceWorkerRegistration.waiting && navigator.serviceWorker.controller) {
      setUpdateAvailable(true);
    } else if (!appServiceWorkerRegistration.installing) {
      setUpdateStatus('The app is up to date.');
    }
  } catch (error) {
    console.error('Could not register or check the app service worker:', error);
    setUpdateStatus('Could not check for updates. Check your connection and try again.');
  }
}

function waitForServiceWorkerInstall(worker) {
  return new Promise((resolve, reject) => {
    if (worker.state === 'installed') {
      resolve();
      return;
    }
    if (worker.state === 'redundant') {
      reject(new Error('The app update worker became redundant before installation.'));
      return;
    }

    worker.addEventListener('statechange', () => {
      if (worker.state === 'installed') resolve();
      if (worker.state === 'redundant') {
        reject(new Error('The app update worker became redundant before installation.'));
      }
    });
  });
}

function activateAppUpdate(worker) {
  reloadAfterServiceWorkerChange = true;
  setUpdateStatus('Installing the update and refreshing the app…');
  const updateButton = document.getElementById('check-updates-button');
  if (updateButton) updateButton.disabled = true;
  worker.postMessage({ type: 'SKIP_WAITING' });
}

async function checkForAppUpdate() {
  const registration = appServiceWorkerRegistration;
  const updateButton = document.getElementById('check-updates-button');
  if (!registration || !updateButton) {
    setUpdateStatus('App updates are not available until the app is connected securely.');
    return;
  }

  updateButton.disabled = true;
  setUpdateStatus('Checking for app updates…');

  try {
    if (registration.waiting) {
      activateAppUpdate(registration.waiting);
      return;
    }

    const workerBeingInstalled = registration.installing;
    await registration.update();
    const installingWorker = registration.installing || workerBeingInstalled;
    if (!registration.waiting && installingWorker) {
      await waitForServiceWorkerInstall(installingWorker);
    }

    if (registration.waiting) {
      setUpdateAvailable(true);
      activateAppUpdate(registration.waiting);
    } else {
      setUpdateAvailable(false);
      setUpdateStatus('The app is already up to date.');
      updateButton.disabled = false;
    }
  } catch (error) {
    console.error('Could not install the app update:', error);
    setUpdateStatus('The update failed. Check your connection and try again.');
    updateButton.disabled = false;
  }
}

// 2. Ladda Excel-filen
async function loadData(registration) {
  console.log("1. loadData har startat!");
  try {
    const workbookName = WORKBOOK_BY_REGISTRATION[registration];
    if (!workbookName) {
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

    hfInstance = HyperFormula.buildFromSheets(sheetsData, { licenseKey: 'gpl-v3' });
    console.log("6. HyperFormula-instans skapad!");
    
    refreshOutputs();
    console.log(`${workbookName} har lästs in i HyperFormula!`);
    
    return sheetsData;
  } catch (error) {
    console.error("Fel vid inläsning av Excel-fil:", error);
    throw error;
  }
}

function getDataFilePath(fileName) {
  return window.location.hostname.includes('github.io')
    ? `/Beechcraft-Performance-EFB/data/${fileName}`
    : `data/${fileName}`;
}

async function loadAirportDatabase() {
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
function setupEventListeners() {
  // Lägg till eventlyssnare här om det behövs
}

function populateAirportSelects() {
  airportSelection = {
    icao: (localStorage.getItem('selected_airport_icao') || '').toUpperCase(),
    runway: localStorage.getItem('selected_airport_runway') || '',
    intersection: localStorage.getItem('selected_airport_intersection') || '',
  };
  if (!getAirportRows(airportSelection.icao).length ||
      !getRunwayRows(airportSelection.icao, airportSelection.runway).length) {
    airportSelection = { icao: '', runway: '', intersection: '' };
  }

  syncAirportControls();
  updateCustomAirportData(getSelectedAirportRecord());
}

// Convert a SheetJS worksheet without losing formulas
function worksheetToHyperFormulaData(worksheet) {
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

    if (cell.f && cell.f.includes('_xlfn.')) {
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

function normalizeFormulaForHyperFormula(formula) {
  const normalizedBooleans = formula.replace(
    /\b(TRUE|FALSE)\b(?!\s*\()/gi,
    '$1()'
  );
  return normalizeHorizontalIndexCalls(normalizedBooleans);
}

function normalizeHorizontalIndexCalls(formula) {
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

function findFormulaQuoteEnd(formula, start, quote) {
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

function findMatchingFormulaParen(formula, openParen) {
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

function splitFormulaArguments(argumentsText) {
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

function isSingleRowRange(expression) {
  const compactExpression = expression.replace(/\s+/g, '');
  const rangeMatch = compactExpression.match(
    /^(?:(?:'(?:[^']|'')+'|[A-Z_][A-Z0-9_.]*)!)?\$?[A-Z]{1,3}\$?(\d+):\$?[A-Z]{1,3}\$?(\d+)$/i
  );
  return Boolean(rangeMatch && rangeMatch[1] === rangeMatch[2]);
}

function isFormulaIdentifierCharacter(char) {
  return Boolean(char && /[A-Z0-9_.]/i.test(char));
}

// Byt mellan flikar
function switchTab(tabName, event) {
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
      getOutputVal(config.sheetName, config.outputs.tor),
      getOutputVal(config.sheetName, config.outputs.tod),
      getOutputVal(config.sheetName, config.outputs.asd),
      getOutputVal(config.sheetName, config.outputs.tora)
    );
  } else if (tabName === 'landing') {
    const config = CELL_MAPPING.landing;
    renderLandingChart(
      getOutputVal(config.sheetName, config.outputs.ldgDistUp),
      getOutputVal(config.sheetName, config.outputs.ldgDistDown),
      getOutputVal(config.sheetName, config.outputs.lda)
    );
  }
  
  if (event && event.currentTarget) {
    event.currentTarget.classList.add('active');
    event.currentTarget.style.background = '#21262d';
    event.currentTarget.style.color = '#fff';
  }
}

function getAirportRows(icao) {
  if (!icao) return [];
  return globalData.airports.filter((airport) =>
    airport.ICAO.trim().toUpperCase() === icao.trim().toUpperCase()
  );
}

function getRunwayRows(icao, runway) {
  if (!runway) return [];
  return getAirportRows(icao).filter((airport) => airport.RWY === runway);
}

function getSelectedAirportRecord() {
  const runwayRows = getRunwayRows(airportSelection.icao, airportSelection.runway);
  if (airportSelection.intersection) {
    return runwayRows.find((airport) => airport.Intersection === airportSelection.intersection) || null;
  }
  return runwayRows.find((airport) => !airport.Intersection) || null;
}

function updateRunwayVisualizationTitle() {
  const title = document.getElementById('takeoff-runway-visualization-title');
  if (!title) return;
  if (!airportSelection.runway) {
    title.textContent = 'Runway visualization';
    return;
  }

  const intersectionLabel = airportSelection.intersection
    ? ` intersection ${airportSelection.intersection}`
    : '';
  title.textContent = `Runway ${airportSelection.runway}${intersectionLabel} visualization`;
}

function syncAirportControls() {
  const icao = airportSelection.icao;
  const airportRows = getAirportRows(icao);
  const runways = [...new Set(airportRows.map((airport) => airport.RWY))];

  ['to', 'ldg'].forEach((prefix) => {
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
      runwaySelect.value = runways.includes(airportSelection.runway) ? airportSelection.runway : '';
    }

    const runwayRows = getRunwayRows(icao, airportSelection.runway);
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
      intersectionSelect.value = intersections.includes(airportSelection.intersection)
        ? airportSelection.intersection
        : '';
    }
    if (intersectionRow) intersectionRow.hidden = intersections.length === 0;
  });
  updateRunwayVisualizationTitle();
}

function updateRunwaySuggestion(message, suggestion = null) {
  runwaySuggestion = suggestion;
  ['to', 'ldg'].forEach((prefix) => {
    const row = document.getElementById(`${prefix}-runway-suggestion-row`);
    const text = document.getElementById(`${prefix}-runway-suggestion-text`);
    const optionsContainer = document.getElementById(`${prefix}-runway-suggestion-options`);
    if (!row || !text || !optionsContainer) return;

    row.hidden = !message;
    text.textContent = message;
    optionsContainer.replaceChildren();
    if (!suggestion) return;

    const runwayRows = getRunwayRows(airportSelection.icao, suggestion.runway);
    const distances = [
      ['TORA', 'TORA [m] (C6)'],
      ['TODA', 'TODA [m](D6)'],
      ['ASDA', 'ASDA [m](E6)'],
    ];
    if (prefix === 'ldg') distances.push(['LDA', 'LDA [m](F6)']);
    runwayRows.forEach((airport) => {
      const option = document.createElement('div');
      option.className = 'runway-suggestion-option';

      const label = document.createElement('strong');
      label.textContent = airport.Intersection
        ? `Intersection ${airport.Intersection} available`
        : 'Full runway available';
      option.appendChild(label);

      const distanceList = document.createElement('p');
      distanceList.className = 'runway-suggestion-distances';
      distanceList.textContent = distances
        .map(([name, field]) => `${name}: ${airport[field] || '—'} m`)
        .join(' | ');
      option.appendChild(distanceList);

      const selectButton = document.createElement('button');
      selectButton.type = 'button';
      selectButton.className = 'runway-suggestion-button';
      selectButton.textContent = airport.Intersection
        ? `Use RWY ${suggestion.runway}, intersection ${airport.Intersection}`
        : `Use RWY ${suggestion.runway}, full runway`;
      selectButton.addEventListener('click', () =>
        applySuggestedRunway(suggestion.runway, airport.Intersection || '')
      );
      option.appendChild(selectButton);
      optionsContainer.appendChild(option);
    });
  });
}

function suggestRunwayFromMetar(metarText) {
  const windMatch = metarText.match(/\b(VRB|\d{3})(\d{2,3})(?:G\d{2,3})?(KT|MPS)\b/i);
  if (!windMatch || windMatch[1].toUpperCase() === 'VRB') {
    updateRunwaySuggestion('No runway suggestion: METAR wind direction is variable or unavailable.');
    return;
  }

  const direction = Number(windMatch[1]);
  const speed = Number(windMatch[2]);
  if (!Number.isFinite(direction) || direction > 360 || !Number.isFinite(speed) || speed === 0) {
    updateRunwaySuggestion('No runway suggestion: METAR wind is calm or has an invalid direction.');
    return;
  }

  const speedKnots = windMatch[3].toUpperCase() === 'MPS' ? speed * 1.94384 : speed;
  const runwayCandidates = new Map();
  const runwaysByName = new Map();
  getAirportRows(airportSelection.icao).forEach((airport) => {
    if (!runwaysByName.has(airport.RWY)) runwaysByName.set(airport.RWY, []);
    runwaysByName.get(airport.RWY).push(airport);
  });
  runwaysByName.forEach((airportRows, runway) => {
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
  if (candidates.length === 0 || candidates[0].headwind <= 0) {
    updateRunwaySuggestion('No runway has a headwind component; select a runway manually.');
    return;
  }

  if (candidates.length > 1 && Math.abs(candidates[0].headwind - candidates[1].headwind) < 0.1) {
    updateRunwaySuggestion('Runways have similar headwind components; select a runway manually.');
    return;
  }

  const suggestion = candidates[0];
  updateRunwaySuggestion(
    `METAR suggests RWY ${suggestion.runway} (${Math.round(suggestion.headwind)} kt headwind). Verify before use.`,
    suggestion
  );
}

function applySuggestedRunway(runway, intersection) {
  if (!runwaySuggestion || runwaySuggestion.runway !== runway) return;
  airportSelection.runway = runway;
  airportSelection.intersection = intersection;
  persistAirportSelection();
  syncAirportControls();
  updateCustomAirportData(getSelectedAirportRecord());
}

function getAirportIcaoCodes() {
  return [...new Set(globalData.airports.map((airport) => airport.ICAO.trim().toUpperCase()))]
    .sort();
}

function hideAirportIcaoSuggestions(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const suggestions = document.getElementById(input.getAttribute('aria-controls'));
  if (!suggestions) return;
  suggestions.hidden = true;
  input.setAttribute('aria-expanded', 'false');
  input.removeAttribute('aria-activedescendant');
}

function showAirportIcaoSuggestions(value, inputId) {
  const input = document.getElementById(inputId);
  const suggestions = document.getElementById(input.getAttribute('aria-controls'));
  if (!suggestions) return;

  const query = value.trim().toUpperCase();
  const exactMatch = getAirportIcaoCodes().includes(query);
  const matches = query && !exactMatch
    ? getAirportIcaoCodes().filter((icao) => icao.startsWith(query)).slice(0, 8)
    : [];

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
      handleAirportIcaoInput(icao);
      input.focus();
    });
    suggestions.appendChild(option);
  });

  suggestions.hidden = matches.length === 0;
  input.setAttribute('aria-expanded', String(matches.length > 0));
}

function handleAirportIcaoKeydown(event, inputId) {
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

function persistAirportSelection() {
  localStorage.setItem('selected_airport_icao', airportSelection.icao);
  localStorage.setItem('selected_airport_runway', airportSelection.runway);
  localStorage.setItem('selected_airport_intersection', airportSelection.intersection);
}

function showAirportSelectionError(message) {
  const errorElement = document.getElementById('airport-selection-error');
  if (!errorElement) return;
  errorElement.textContent = message;
  errorElement.hidden = !message;
}

function airportCellValue(value) {
  if (value === null || value === undefined || String(value).trim() === '') return null;
  const text = String(value).trim();
  const number = Number(text);
  return Number.isFinite(number) ? number : text;
}

function updateCustomAirportData(airport) {
  if (!hfInstance) return;

  try {
    const airportConfig = CELL_MAPPING.airport;
    const airportSheet = hfInstance.getSheetId(airportConfig.sheetName);
    Object.entries(airportConfig.inputs).forEach(([dataField, cellRef]) => {
      const position = parseCellRef(cellRef);
      if (!position) throw new Error(`Invalid custom airport cell reference: ${cellRef}`);
      const value = airport ? airportCellValue(airport[dataField]) : null;
      hfInstance.setCellContents(
        { sheet: airportSheet, col: position.col, row: position.row },
        [[value]]
      );
    });

    ['takeoff', 'landing'].forEach((sheetType) => {
      const config = CELL_MAPPING[sheetType];
      const sheet = hfInstance.getSheetId(config.sheetName);
      const position = parseCellRef(config.inputs.airportAndRwy);
      if (!position) throw new Error(`Invalid ${sheetType} airport cell reference.`);
      hfInstance.setCellContents(
        { sheet, col: position.col, row: position.row },
        [['Custom airport']]
      );
    });

    const missingFields = airport
      ? Object.keys(airportConfig.inputs).filter((dataField) =>
        !OPTIONAL_AIRPORT_DATA_FIELDS.includes(dataField) && airportCellValue(airport[dataField]) === null
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

function handleAirportIcaoInput(value) {
  const icao = value.trim().toUpperCase();
  if (icao === airportSelection.icao) {
    syncAirportControls();
    showAirportIcaoSuggestions(icao, document.activeElement.id);
    return;
  }

  airportSelection = { icao, runway: '', intersection: '' };
  persistAirportSelection();
  syncAirportControls();
  const inputId = document.activeElement.id;
  if (inputId === 'to-airport-icao' || inputId === 'ldg-airport-icao') {
    showAirportIcaoSuggestions(icao, inputId);
  }
  clearAirportMetar();
  updateRunwaySuggestion('');
  updateCustomAirportData(null);

  const airportExists = /^[A-Z0-9]{4}$/.test(icao) && getAirportRows(icao).length > 0;
  if (/^[A-Z0-9]{4}$/.test(icao) && !airportExists) {
    showAirportSelectionError(`ICAO ${icao} was not found in the airport database.`);
  } else if (airportExists) {
    fetchMetarForAirport();
  }
}

function handleAirportRunwayChange(runway) {
  airportSelection.runway = runway;
  airportSelection.intersection = '';
  persistAirportSelection();
  syncAirportControls();

  const airport = getSelectedAirportRecord();
  updateCustomAirportData(airport);
}

function handleAirportIntersectionChange(intersection) {
  airportSelection.intersection = intersection;
  persistAirportSelection();
  syncAirportControls();

  const airport = getSelectedAirportRecord();
  updateCustomAirportData(airport);
}

function colLetterToIndex(letter) {
  let column = 0;
  for (let i = 0; i < letter.length; i++) {
    column += (letter.charCodeAt(i) - 64) * Math.pow(26, letter.length - i - 1);
  }
  return column - 1;
}

function parseCellRef(cellRef) {
  const match = cellRef.match(/^([A-Z]+)(\d+)$/);
  if (!match) return null;
  const col = colLetterToIndex(match[1]);
  const row = parseInt(match[2], 10) - 1;
  return { col, row };
}

function updateEngineCellVal(sheetType, fieldKey, value) {
  if (!hfInstance) return;
  const config = CELL_MAPPING[sheetType];
  if (!config) return;
  const cellRef = config.inputs[fieldKey];
  if (!cellRef) return;

  try {
    const sheetId = hfInstance.getSheetId(config.sheetName);
    const pos = parseCellRef(cellRef);
    if (!pos) return;

    hfInstance.setCellContents({ sheet: sheetId, col: pos.col, row: pos.row }, [[value]]);
    refreshOutputs();
  } catch (e) {
    console.error(`Fel vid uppdatering av cell ${fieldKey} på ${sheetType}:`, e);
  }
}

function getOutputVal(sheetName, cellRef, roundNumber = true) {
  if (!hfInstance) return '-';
  if (!cellRef) return '-';
  try {
    const sheetId = hfInstance.getSheetId(sheetName);
    const pos = parseCellRef(cellRef);
    if (!pos) return '-';

    let val = hfInstance.getCellValue({ sheet: sheetId, col: pos.col, row: pos.row });
    if (roundNumber && typeof val === 'number') {
      val = Math.round(val);
    }

    return (val !== null && val !== undefined && val !== '') ? val : '-';
  } catch (e) {
    return '-';
  }
}

function updateMissedClimbCard(value) {
  const card = document.getElementById('kpi-missed-climb-card');
  const valueElement = document.getElementById('ldg-missed-climb');
  if (!card || !valueElement) return;

  const climbGradient = Number(value);
  if (value === '-' || !Number.isFinite(climbGradient)) {
    valueElement.textContent = '-- %';
    card.style.background = '#0d1117';
    card.style.borderColor = '#30363d';
    return;
  }

  valueElement.textContent = `${climbGradient.toFixed(1)} %`;
  const isBelowMinimum = climbGradient < 2.5;
  card.style.background = isBelowMinimum ? '#3d1414' : '#0d1117';
  card.style.borderColor = isBelowMinimum ? '#f85149' : '#30363d';
}

function handleTakeoffMass(val) {
  const span = document.getElementById('to-mass-val');
  if (span) span.innerText = val;
  updateEngineCellVal('takeoff', 'mass', Number(val));
}

function handleLandingMass(val) {
  const span = document.getElementById('ldg-mass-val');
  if (span) span.innerText = val;
  updateEngineCellVal('landing', 'mass', Number(val));
}

function handleTakeoffFlaps(val) { updateEngineCellVal('takeoff', 'flaps', val); }
function handleLandingFlaps(val) { updateEngineCellVal('landing', 'flaps', val); }

function handleWeather(sheetType, param, val) {
  updateEngineCellVal(sheetType, param, val === "" ? "" : Number(val));
}

function handleWeatherOverride(sheetType, paramOverrideKey, val) {
  updateEngineCellVal(sheetType, paramOverrideKey, val === "" ? "" : Number(val));
}

// Ny funktion för manuell väderinmatning med amber-styling
function handleManualWeatherInput(sheetType, paramKey, inputElement) {
    const val = inputElement.value;
    
    if (val.trim() !== "") {
        inputElement.style.color = "#d29922";
        inputElement.style.borderColor = "#d29922";
        inputElement.style.background = "#221a05";
    } else {
        inputElement.style.color = "#fff";
        inputElement.style.borderColor = "#30363d";
        inputElement.style.background = "#0d1117";
    }

    updateEngineCellVal(sheetType, paramKey, val === "" ? "" : Number(val));
}

function refreshOutputs() {
  if (!hfInstance) return;
  const to = CELL_MAPPING.takeoff;
  const ldg = CELL_MAPPING.landing;

  const v1Val = getOutputVal(to.sheetName, to.outputs.v1);
  safeSetText('check-v1-val', v1Val);
  
  const badgeV1 = document.getElementById('badge-v1');
  if (badgeV1) {
    if (v1Val !== '-' && v1Val !== null && v1Val !== undefined && !isNaN(Number(v1Val))) {
      badgeV1.innerText = "OK";
      badgeV1.style.background = "rgba(46, 160, 67, 0.15)";
      badgeV1.style.color = "#3fb950";
    } else {
      badgeV1.innerText = "FAIL";
      badgeV1.style.background = "rgba(248, 81, 73, 0.15)";
      badgeV1.style.color = "#f85149";
    }
  }

  const cloudVal = getOutputVal(to.sheetName, to.outputs.cloudBase);
  const escapeVal = getOutputVal(to.sheetName, to.outputs.escapeRoute);
  
  safeSetText('res-to-cloud', cloudVal);
  safeSetText('res-to-escape', escapeVal);

  const engineOutCard = document.getElementById('card-engine-out');
  if (engineOutCard) {
    const hasData = (cloudVal !== '-' && cloudVal !== '' && cloudVal != null) || 
                    (escapeVal !== '-' && escapeVal !== '' && escapeVal != null);
    engineOutCard.style.display = hasData ? 'block' : 'none';
  }

  const badgeMass = document.getElementById('badge-mass-limit');
  if (badgeMass) {
    const torVal = getOutputVal(to.sheetName, to.outputs.tor);
    const toraVal = getOutputVal(to.sheetName, to.outputs.tora);
    
    let isCheckOk = true;

    if (String(torVal).startsWith('#') || torVal === '-') {
      isCheckOk = false;
    } else {
      const tor = Number(torVal);
      const tora = Number(toraVal);
      if (!isNaN(tor) && !isNaN(tora) && tor > tora) {
        isCheckOk = false;
      }
      
      if (isCheckOk && !checkContaminationLogic()) {
        isCheckOk = false;
      }
    }

    if (isCheckOk) {
      badgeMass.innerText = "OK";
      badgeMass.style.background = "rgba(46, 160, 67, 0.15)";
      badgeMass.style.color = "#3fb950";
    } else {
      badgeMass.innerText = "FAIL";
      badgeMass.style.background = "rgba(248, 81, 73, 0.15)";
      badgeMass.style.color = "#f85149";
    }
    
  }
const hwTwValue = getOutputVal(to.sheetName, to.outputs.hwTw);
const xwValue = getOutputVal(to.sheetName, to.outputs.xw);
const xwLimitValue = getOutputVal(to.sheetName, to.outputs.xwLimit);
// Hämta värden för landning (anpassa efter dina egna output-nycklar i ldg)
const ldgHwTw = getOutputVal(ldg.sheetName, ldg.outputs.hwTw);
const ldgXw = getOutputVal(ldg.sheetName, ldg.outputs.xw);
const ldgXwLimit = getOutputVal(ldg.sheetName, ldg.outputs.xwLimit);

  // Kör vindkontrollen för landning
  updateWindCheckCardLdg(ldgHwTw, ldgXw, ldgXwLimit);

updateWindCheckCard(hwTwValue, xwValue, xwLimitValue);
  safeSetValue('to-wind-dir', getOutputVal(to.sheetName, to.inputs.windDir));
  safeSetValue('to-wind-spd', getOutputVal(to.sheetName, to.inputs.windSpeed));
  safeSetValue('to-oat', getOutputVal(to.sheetName, to.inputs.oat));
  safeSetValue('to-qnh', getOutputVal(to.sheetName, to.inputs.qnh));

  safeSetText('res-to-v1', getOutputVal(to.sheetName, to.outputs.v1));
  safeSetText('res-to-vr', getOutputVal(to.sheetName, to.outputs.vr));
  safeSetText('res-to-v2', getOutputVal(to.sheetName, to.outputs.v2));
  safeSetText('res-to-tod', getOutputVal(to.sheetName, to.outputs.tod));
  safeSetText('res-to-asd', getOutputVal(to.sheetName, to.outputs.asd));
  safeSetText('res-to-tora', getOutputVal(to.sheetName, to.outputs.tora));
  safeSetText('res-to-asda', getOutputVal(to.sheetName, to.outputs.asda));
  safeSetText('res-to-tor', getOutputVal(to.sheetName, to.outputs.tor));
  safeSetText('res-to-hwtw', getOutputVal(to.sheetName, to.outputs.hwTw));
  safeSetText('res-to-xw', getOutputVal(to.sheetName, to.outputs.xw));
  safeSetText('res-to-xwlimit', getOutputVal(to.sheetName, to.outputs.xwLimit));
  safeSetText('res-to-g19', getOutputVal(to.sheetName, to.outputs.g19));
  safeSetText('res-to-emup-vref', getOutputVal(to.sheetName, to.outputs.emUpVref));
  safeSetText('res-to-emup-dist', getOutputVal(to.sheetName, to.outputs.emUpDist));
  safeSetText('res-to-emdown-vref', getOutputVal(to.sheetName, to.outputs.emDownVref));
  safeSetText('res-to-emdown-dist', getOutputVal(to.sheetName, to.outputs.emDownDist));
  safeSetText('res-to-cloud', getOutputVal(to.sheetName, to.outputs.cloudBase));
  safeSetText('res-to-escape', getOutputVal(to.sheetName, to.outputs.escapeRoute));

  // Climb OEI vs Req med 1 decimal och röd varning om req > oei
  const reqVal = getOutputVal(to.sheetName, to.outputs.climbGrad);
  const oeiVal = getOutputVal(to.sheetName, to.outputs.g19);
  updateClimbCheckCard(reqVal, oeiVal);

  safeSetText('check-tor-val', getOutputVal(to.sheetName, to.outputs.tor));
  safeSetText('check-tora-val', getOutputVal(to.sheetName, to.outputs.tora));
  safeSetText('check-asd-val', getOutputVal(to.sheetName, to.outputs.asd));
  safeSetText('check-asda-val', getOutputVal(to.sheetName, to.outputs.asda));
  safeSetText('check-tod-val', getOutputVal(to.sheetName, to.outputs.tod));
  safeSetText('check-toda-val-alt', getOutputVal(to.sheetName, to.outputs.toda)); // Hämtar cell C21 (toda)
  safeSetText('check-v1-val', getOutputVal(to.sheetName, to.outputs.v1));

  updateBadgeStatus('badge-tor', getOutputVal(to.sheetName, to.outputs.tor), getOutputVal(to.sheetName, to.outputs.tora), (a, b) => a <= b);
  updateBadgeStatus('badge-asd', getOutputVal(to.sheetName, to.outputs.asd), getOutputVal(to.sheetName, to.outputs.asda), (a, b) => a <= b);
  updateBadgeStatus('badge-tod', getOutputVal(to.sheetName, to.outputs.tod), getOutputVal(to.sheetName, to.outputs.toda), (a, b) => a <= b); // Jämför TOD mot TODA
 
  safeSetText('res-ldg-lda', getOutputVal(ldg.sheetName, ldg.outputs.lda));
  safeSetText('res-ldg-hwtw', getOutputVal(ldg.sheetName, ldg.outputs.hwTw));
  safeSetText('res-ldg-xw', getOutputVal(ldg.sheetName, ldg.outputs.xw));
  safeSetText('res-ldg-xwlimit', getOutputVal(ldg.sheetName, ldg.outputs.xwLimit));
  safeSetText('res-ldg-missed', getOutputVal(ldg.sheetName, ldg.outputs.missedClimb));
  const missedClimbValue = getOutputVal(ldg.sheetName, ldg.outputs.missedClimb, false);
  updateMissedClimbCard(missedClimbValue);
  const landingFlaps = document.getElementById('ldg-flaps')?.value || 'DOWN';
  const landingVref = landingFlaps === 'UP'
    ? getOutputVal(ldg.sheetName, ldg.outputs.vrefUp)
    : getOutputVal(ldg.sheetName, ldg.outputs.vrefDown);
  safeSetText('res-ldg-vref', landingVref);
  safeSetText('res-ldg-vref-label', `VREF / FLAPS ${landingFlaps}`);
  safeSetText('res-ldg-vrefup', getOutputVal(ldg.sheetName, ldg.outputs.vrefUp));
  safeSetText('res-ldg-distup', getOutputVal(ldg.sheetName, ldg.outputs.ldgDistUp));
  safeSetText('res-ldg-vrefdown', getOutputVal(ldg.sheetName, ldg.outputs.vrefDown));
  safeSetText('res-ldg-distdown', getOutputVal(ldg.sheetName, ldg.outputs.ldgDistDown));

  renderTakeoffChart(
    getOutputVal(to.sheetName, to.outputs.tor),
    getOutputVal(to.sheetName, to.outputs.tod),
    getOutputVal(to.sheetName, to.outputs.asd),
    getOutputVal(to.sheetName, to.outputs.tora)
  );

  renderLandingChart(
    getOutputVal(ldg.sheetName, ldg.outputs.ldgDistUp),
    getOutputVal(ldg.sheetName, ldg.outputs.ldgDistDown), // <-- Tillagd
    getOutputVal(ldg.sheetName, ldg.outputs.lda)
  );
}

function updateBadgeStatus(elementId, val1, val2, conditionFn) {
  const badge = document.getElementById(elementId);
  if (!badge) return;

  if (val1 === '-' || val2 === '-' || val1 === null || val2 === null || 
      String(val1).startsWith('#') || String(val2).startsWith('#')) {
    badge.innerText = "FAIL";
    badge.style.background = "rgba(248, 81, 73, 0.15)";
    badge.style.color = "#f85149";
    return;
  }

  const num1 = Number(val1);
  const num2 = Number(val2);

  if (isNaN(num1) || isNaN(num2)) {
    badge.innerText = "FAIL";
    badge.style.background = "rgba(248, 81, 73, 0.15)";
    badge.style.color = "#f85149";
    return;
  }

  if (conditionFn(num1, num2)) {
    badge.innerText = "OK";
    badge.style.background = "rgba(46, 160, 67, 0.15)";
    badge.style.color = "#3fb950";
  } else {
    badge.innerText = "FAIL";
    badge.style.background = "rgba(248, 81, 73, 0.15)";
    badge.style.color = "#f85149";
  }
}

function safeSetText(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) el.innerText = text;
}

function safeSetValue(elementId, value) {
  const el = document.getElementById(elementId);
  if (el) el.value = (value !== '-' && value !== null && value !== undefined) ? value : '';
}

// Exportera funktioner globalt
window.switchTab = switchTab;
window.handleAirportIcaoInput = handleAirportIcaoInput;
window.handleAirportIcaoKeydown = handleAirportIcaoKeydown;
window.showAirportIcaoSuggestions = showAirportIcaoSuggestions;
window.handleAirportRunwayChange = handleAirportRunwayChange;
window.handleAirportIntersectionChange = handleAirportIntersectionChange;
window.applySuggestedRunway = applySuggestedRunway;
window.handleTakeoffMass = handleTakeoffMass;
window.handleLandingMass = handleLandingMass;
window.handleTakeoffFlaps = handleTakeoffFlaps;
window.handleLandingFlaps = handleLandingFlaps;
window.handleWeather = handleWeather;
window.handleWeatherOverride = handleWeatherOverride;
window.handleManualWeatherInput = handleManualWeatherInput;
window.updateEngineCellVal = updateEngineCellVal;
window.handleRegistrationChange = handleRegistrationChange;

document.addEventListener('DOMContentLoaded', init);

// Uppdaterad METAR-hämtning med färglogik (<35 min grön, 35-60 min amber, >60 min eller icao-fel röd)
async function fetchMetarText(url, sourceName) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`${sourceName} returned HTTP ${response.status}`);
    }
    return (await response.text()).trim();
  } finally {
    clearTimeout(timeoutId);
  }
}

function validateMetar(metarText, expectedIcao) {
  const report = metarText.split(/\r?\n/).map(line => line.trim()).find(Boolean) || '';
  const stationMatch = report.match(/^(?:(?:METAR|SPECI)\s+)?([A-Z]{4})\b/i);
  if (!stationMatch || stationMatch[1].toUpperCase() !== expectedIcao) {
    throw new Error(`METAR station does not match ${expectedIcao}`);
  }

  const timeMatch = report.match(/\b(\d{2})(\d{2})(\d{2})Z\b/);
  if (!timeMatch) {
    throw new Error('METAR report has no valid observation time');
  }

  const [, dayText, hourText, minuteText] = timeMatch;
  const reportDay = Number(dayText);
  const reportHour = Number(hourText);
  const reportMinute = Number(minuteText);
  if (reportDay < 1 || reportDay > 31 || reportHour > 23 || reportMinute > 59) {
    throw new Error('METAR report has an invalid observation time');
  }

  const now = new Date();
  const reportDates = [-1, 0, 1]
    .map(monthOffset => new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth() + monthOffset,
      reportDay,
      reportHour,
      reportMinute
    )))
    .filter(date => date.getUTCDate() === reportDay && date <= now);

  if (reportDates.length === 0) {
    throw new Error('METAR observation time is in the future or invalid');
  }

  const reportDate = reportDates.reduce((latest, date) => date > latest ? date : latest);
  const ageMinutes = (now - reportDate) / 60000;
  if (ageMinutes > 60) {
    throw new Error(`METAR is too old (${Math.floor(ageMinutes)} minutes)`);
  }

  return {
    text: report.replace(/^(?:METAR|SPECI)\s+/i, ''),
    ageMinutes
  };
}

function clearAirportMetar() {
  [
    { sheetType: 'takeoff', displayId: 'to-metar-display' },
    { sheetType: 'landing', displayId: 'ldg-metar-display' },
  ].forEach(({ sheetType, displayId }) => {
    updateEngineCellVal(sheetType, sheetType === 'takeoff' ? 'to-metar' : 'ldg-metar', '');
    const displaySpan = document.getElementById(displayId);
    if (displaySpan) {
      displaySpan.textContent = '-';
      displaySpan.style.color = '#8b949e';
    }
  });
}

async function fetchMetarForAirport() {
  if (!hfInstance) return;
  const icaoCode = airportSelection.icao;
  updateRunwaySuggestion('Checking METAR wind for a runway suggestion...');
  const displaySpans = [
    document.getElementById('to-metar-display'),
    document.getElementById('ldg-metar-display'),
  ].filter(Boolean);
  try {
    if (!/^[A-Z0-9]{4}$/.test(icaoCode) || !getAirportRows(icaoCode).length) {
      clearAirportMetar();
      updateRunwaySuggestion('');
      return;
    }

    displaySpans.forEach((displaySpan) => {
      displaySpan.textContent = "Downloading METAR...";
      displaySpan.style.color = "#8b949e";
    });

    const noaaUrl = `https://aviationweather.gov/api/data/metar?ids=${encodeURIComponent(icaoCode)}&format=raw`;
    const proxyUrl = `https://script.google.com/macros/s/AKfycbzfUIgEmCV4kCVnD1hK6rD8aWnurtyNvQQt6towRzG6QWA07-0iRZ5aZ5ctJIhBY_98YA/exec?icao=${encodeURIComponent(icaoCode)}`;
    const metarSources = window.location.hostname.includes('github.io')
      ? [{ url: proxyUrl, name: 'Apps Script proxy' }, { url: noaaUrl, name: 'NOAA AWC' }]
      : [{ url: noaaUrl, name: 'NOAA AWC' }, { url: proxyUrl, name: 'Apps Script proxy' }];
    let validatedMetar;
    let sourceName = metarSources[0].name;

    try {
      validatedMetar = validateMetar(await fetchMetarText(metarSources[0].url, metarSources[0].name), icaoCode);
    } catch (primaryError) {
      console.warn(`${metarSources[0].name} failed; trying ${metarSources[1].name}:`, primaryError);
      sourceName = metarSources[1].name;
      validatedMetar = validateMetar(await fetchMetarText(metarSources[1].url, sourceName), icaoCode);
    }

    if (airportSelection.icao !== icaoCode) return;

    console.info(`METAR hämtad från ${sourceName}.`);
    updateEngineCellVal('takeoff', 'to-metar', validatedMetar.text);
    updateEngineCellVal('landing', 'ldg-metar', validatedMetar.text);

    displaySpans.forEach((displaySpan) => {
      displaySpan.textContent = validatedMetar.text;
      displaySpan.style.color = validatedMetar.ageMinutes >= 35 ? '#d29922' : '#3fb950';
    });
    suggestRunwayFromMetar(validatedMetar.text);
    parseAndPopulateMetarData(validatedMetar.text);
    parseAndPopulateLandingMetarData(validatedMetar.text);
  } catch (error) {
    console.error("Fel vid hämtning av METAR:", error);
    if (airportSelection.icao !== icaoCode) return;
    updateRunwaySuggestion('No runway suggestion: METAR could not be retrieved.');
    displaySpans.forEach((displaySpan) => {
      displaySpan.textContent = "METAR unavailable or invalid from both sources";
      displaySpan.style.color = "#f85149";
    });
  }
}

function fetchMetarForSelectedAirport() {
  fetchMetarForAirport();
}

window.fetchMetarForSelectedAirport = fetchMetarForSelectedAirport;

function parseAndPopulateMetarData(metarText) {
  if (!metarText || metarText.includes("INGEN METAR") || metarText.includes("OFFLINE")) return;

  // Nollställ färgerna på fälten till standard vid automatisk METAR-ifyllnad
  ['to-wind-dir', 'to-wind-spd', 'to-oat', 'to-qnh'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
          el.style.color = "#fff";
          el.style.borderColor = "#30363d";
          el.style.background = "#0d1117";
      }
  });

  const windRegex = /(?:(\d{3}|VRB)(\d{2,3})(?:G(\d{2,3}))?KT|(\d{3}|VRB)(\d{2,3})(?:G(\d{2,3}))?MPS)/i;
  const windMatch = metarText.match(windRegex);

  if (windMatch) {
    let dir = windMatch[1] || windMatch[4];
    let spd = windMatch[2] || windMatch[5];
    let dirVal = (dir !== "VRB") ? parseInt(dir, 10) : 0;
    let spdVal = parseInt(spd, 10);

    updateEngineCellVal('takeoff', 'windDir', dirVal);
    updateEngineCellVal('takeoff', 'windSpeed', spdVal);

    let elDir = document.getElementById('to-wind-dir');
    let elSpd = document.getElementById('to-wind-spd');
    if (elDir) elDir.value = dirVal;
    if (elSpd) elSpd.value = spdVal;
  }

  const tempRegex = /\s(M?\d{2})\/(M?\d{2})\s/;
  const tempMatch = metarText.match(tempRegex);

  if (tempMatch) {
    let tempStr = tempMatch[1];
    if (tempStr.startsWith('M')) {
      tempStr = '-' + tempStr.substring(1);
    }
    let oatVal = parseInt(tempStr, 10);
    updateEngineCellVal('takeoff', 'oat', oatVal);
    let elOat = document.getElementById('to-oat');
    if (elOat) elOat.value = oatVal;
  }

  const qnhRegex = /\bQ(\d{4})\b/i;
  const qnhMatch = metarText.match(qnhRegex);

  if (qnhMatch) {
    let qnhVal = parseInt(qnhMatch[1], 10);
    updateEngineCellVal('takeoff', 'qnh', qnhVal);
    let elQnh = document.getElementById('to-qnh');
    if (elQnh) elQnh.value = qnhVal;
  } else {
    const altRegex = /\bA(\d{4})\b/i;
    const altMatch = metarText.match(altRegex);
    if (altMatch) {
      let hpa = Math.round(parseInt(altMatch[1], 10) * 0.338639);
      updateEngineCellVal('takeoff', 'qnh', hpa);
      let elQnh = document.getElementById('to-qnh');
      if (elQnh) elQnh.value = hpa;
    }
  }

  if (typeof refreshOutputs === 'function') {
    refreshOutputs();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const savedReg = localStorage.getItem('selected_reg');
  if (savedReg) {
    const regSelect = document.getElementById('global-registration');
    if (regSelect) regSelect.value = savedReg;
  }
});

function checkContaminationLogic() {
  if (!hfInstance) return true;

  const config = CELL_MAPPING.takeoff;
  const sheetId = hfInstance.getSheetId(config.sheetName);
  
  const rccPos = parseCellRef("C10"); 
  const currentRccVal = hfInstance.getCellValue({ sheet: sheetId, col: rccPos.col, row: rccPos.row });

  if (currentRccVal === 6 || currentRccVal === '6' || currentRccVal === '-' || currentRccVal === 'Dry' || currentRccVal === '') {
    return true; 
  }

  const currentTor = Number(getOutputVal(config.sheetName, config.outputs.tor));

  hfInstance.setCellContents({ sheet: sheetId, col: rccPos.col, row: rccPos.row }, 6);
  const dryTor = Number(getOutputVal(config.sheetName, config.outputs.tor));
  hfInstance.setCellContents({ sheet: sheetId, col: rccPos.col, row: rccPos.row }, currentRccVal);

  if (!isNaN(currentTor) && !isNaN(dryTor) && dryTor > 0) {
    return currentTor >= dryTor;
  }

  return true;
}

function renderTakeoffChart(tor, tod, asd, tora) {
    const toraNum = parseFloat(tora) || 0;
    if (toraNum <= 0) return;

    const getRatio = (val) => {
        const num = parseFloat(val) || 0;
        return Math.min(Math.max(num / toraNum, 0), 1);
    };
    const runwayStrip = document.querySelector('#page-takeoff .runway-strip');
    const usedRunway = document.getElementById('takeoff-used-runway');
    const maxDistance = Math.max(
        parseFloat(tor) || 0,
        parseFloat(tod) || 0,
        parseFloat(asd) || 0
    );
    const usedRatio = getRatio(maxDistance);

    [
        ['tor', tor],
        ['tod', tod],
        ['asd', asd]
    ].forEach(([id, value]) => {
        const marker = document.getElementById(`${id}-marker`);
        if (marker) {
            const markerRatio = getRatio(value);
            marker.style.left = `${runwayStrip ? runwayStrip.offsetLeft + markerRatio * runwayStrip.clientWidth : 0}px`;
            marker.setAttribute('data-val', value || 0);
        }
    });

    if (runwayStrip && usedRunway) {
        usedRunway.style.width = `${usedRatio * 100}%`;
    }

    const toraLabel = document.getElementById('tora-label');
    if (toraLabel) {
        toraLabel.textContent = `TORA: ${toraNum} m`;
    }
}

function renderLandingChart(ldgDistUp, ldgDistDown, lda) {
    const ldaNum = parseFloat(lda) || 0;
    if (ldaNum <= 0) return;

    // Hämta vald flaps-setting (UP eller DOWN)
    const flapsSelect = document.getElementById('ldg-flaps');
    const currentFlaps = flapsSelect ? flapsSelect.value : 'DOWN';

    const markerUp = document.getElementById('ldg-dist-marker');
    const markerDown = document.getElementById('ldg-dist-down-marker');
    const runwayStrip = document.querySelector('#page-landing .runway-strip');
    const usedRunway = document.getElementById('landing-used-runway');
    const activeDistance = currentFlaps === 'UP' ? ldgDistUp : ldgDistDown;
    const activeMarker = currentFlaps === 'UP' ? markerUp : markerDown;
    const distanceRatio = Math.min(
        Math.max((parseFloat(activeDistance) || 0) / ldaNum, 0),
        1
    );

    if (activeMarker) {
        const markerLeft = runwayStrip
            ? runwayStrip.offsetLeft + distanceRatio * runwayStrip.clientWidth
            : 0;
        activeMarker.style.left = `${markerLeft}px`;
        activeMarker.setAttribute('data-val', activeDistance || 0);
    }

    if (runwayStrip && usedRunway) {
        usedRunway.style.width = `${distanceRatio * 100}%`;
    }

    // Visa eller dölj markörer beroende på vald flaps-inställning
    if (currentFlaps === 'UP') {
        if (markerUp) {
            markerUp.style.display = 'block';
        }
        if (markerDown) {
            markerDown.style.display = 'none';
        }
    } else {
        if (markerDown) {
            markerDown.style.display = 'block';
        }
        if (markerUp) {
            markerUp.style.display = 'none';
        }
    }

    const ldaLabel = document.getElementById('lda-label');
    if (ldaLabel) {
        ldaLabel.textContent = `LDA: ${ldaNum} m`;
    }
}

function updateClimbCheckCard(actualValue, reqValue) {
    const actualNum = parseFloat(actualValue);
    const reqNum = parseFloat(reqValue);

    const actualSpan = document.getElementById('res-to-oei');
    const reqSpan = document.getElementById('res-to-req');
    const cardContainer = document.getElementById('card-climb-check');

    if (isNaN(actualNum) || isNaN(reqNum)) {
        actualSpan.textContent = "-";
        reqSpan.textContent = "-";
        cardContainer.style.background = "#0d1117";
        cardContainer.style.borderColor = "#30363d";
        return;
    }

    actualSpan.textContent = actualNum.toFixed(1) + "%";
    reqSpan.textContent = reqNum.toFixed(1) + "%";

    if (reqNum > actualNum) {
        cardContainer.style.background = "#3d1414";
        cardContainer.style.borderColor = "#f85149";
    } else {
        cardContainer.style.background = "#0d1117";
        cardContainer.style.borderColor = "#30363d";
    }
}

function updateWindCheckCard(hwTwVal, xwVal, xwLimitVal) {
    const cardContainer = document.getElementById('card-wind-check');
    const hwTwSpan = document.getElementById('res-to-hwtw');
    const xwSpan = document.getElementById('res-to-xw');
    const xwLimitSpan = document.getElementById('res-to-xwlimit');

    if (!cardContainer) return;

    hwTwSpan.textContent = hwTwVal || "-";
    xwSpan.textContent = xwVal || "-";
    xwLimitSpan.textContent = xwLimitVal || "-";

    cardContainer.style.background = "#0d1117";
    cardContainer.style.borderColor = "#30363d";
    hwTwSpan.style.color = "#fff";
    xwSpan.style.color = "#fff";

    const hwTwNum = parseFloat(hwTwVal);
    const xwNum = parseFloat(xwVal);
    const xwLimitNum = parseFloat(xwLimitVal);

    let isRed = false;
    let isAmber = false;

    if (!isNaN(xwNum) && !isNaN(xwLimitNum) && xwNum > xwLimitNum) {
        isRed = true;
    }

    if (!isNaN(hwTwNum)) {
        if (hwTwNum < 0) {
            if (hwTwNum >= -10) {
                isAmber = true;
            } else {
                isRed = true;
            }
        }
    } else if (typeof hwTwVal === 'string' && hwTwVal.toUpperCase().includes('TW')) {
        const match = hwTwVal.match(/([\d.]+)\s*TW/i);
        if (match) {
            const twVal = parseFloat(match[1]);
            if (twVal > 0 && twVal <= 10) {
                isAmber = true;
            } else if (twVal > 10) {
                isRed = true;
            }
        }
    }

    if (isRed) {
        cardContainer.style.background = "#3d1414";
        cardContainer.style.borderColor = "#f85149";
    } else if (isAmber) {
        cardContainer.style.background = "#3b2e0c";
        cardContainer.style.borderColor = "#d29922";
    }
}

function onManualInputChange(inputElement) {
    if (inputElement.value.trim() !== "") {
        inputElement.style.color = "#d29922";
        inputElement.style.borderColor = "#d29922";
        inputElement.style.background = "#221a05";
    } else {
        inputElement.style.color = "#fff";
        inputElement.style.borderColor = "#30363d";
        inputElement.style.background = "#0d1117";
    }
}

function updateWindCheckCardLdg(hwTwVal, xwVal, xwLimitVal) {
    const cardContainer = document.getElementById('card-wind-check-ldg');
    const hwTwSpan = document.getElementById('res-ldg-hwtw');
    const xwSpan = document.getElementById('res-ldg-xw');
    const xwLimitSpan = document.getElementById('res-ldg-xwlimit');

    if (!cardContainer) return;

    hwTwSpan.textContent = hwTwVal || "-";
    xwSpan.textContent = xwVal || "-";
    xwLimitSpan.textContent = xwLimitVal || "-";

    // Standardläge (mörkt)
    cardContainer.style.background = "#0d1117";
    cardContainer.style.borderColor = "#30363d";
    hwTwSpan.style.color = "#fff";
    xwSpan.style.color = "#fff";

    const hwTwNum = parseFloat(hwTwVal);
    const xwNum = parseFloat(xwVal);
    const xwLimitNum = parseFloat(xwLimitVal);

    let isRed = false;
    let isAmber = false;

    // Kontrollera sidvind mot limit
    if (!isNaN(xwNum) && !isNaN(xwLimitNum) && xwNum > xwLimitNum) {
        isRed = true;
    }

    // Kontrollera medvind / motvind (negativt värde = medvind)
    if (!isNaN(hwTwNum)) {
        if (hwTwNum < 0) {
            if (hwTwNum >= -10) {
                isAmber = true; // Medvind upp till 10 knop = Amber
            } else {
                isRed = true;   // Medvind över 10 knop = Röd
            }
        }
    } else if (typeof hwTwVal === 'string' && hwTwVal.toUpperCase().includes('TW')) {
        const match = hwTwVal.match(/([\d.]+)\s*TW/i);
        if (match) {
            const twVal = parseFloat(match[1]);
            if (twVal > 0 && twVal <= 10) {
                isAmber = true;
            } else if (twVal > 10) {
                isRed = true;
            }
        }
    }

    // Applicera styling baserat på status
    if (isRed) {
        cardContainer.style.background = "#3d1414";
        cardContainer.style.borderColor = "#f85149";
    } else if (isAmber) {
        cardContainer.style.background = "#3b2e0c";
        cardContainer.style.borderColor = "#d29922";
    }
}

//--------------AUTOPOPULATEMETAR_LAND BELOW-----------------
function parseAndPopulateLandingMetarData(metarText) {
  if (!metarText || metarText.includes("INGEN METAR") || metarText.includes("OFFLINE")) return;

  // Nollställ färgerna på landningsfälten till standard vid automatisk METAR-ifyllnad
  ['ldg-wind-dir', 'ldg-wind-spd', 'ldg-oat', 'ldg-qnh'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
          el.style.color = "#fff";
          el.style.borderColor = "#30363d";
          el.style.background = "#0d1117";
      }
  });

  const windRegex = /(?:(\d{3}|VRB)(\d{2,3})(?:G(\d{2,3}))?KT|(\d{3}|VRB)(\d{2,3})(?:G(\d{2,3}))?MPS)/i;
  const windMatch = metarText.match(windRegex);

  if (windMatch) {
    let dir = windMatch[1] || windMatch[4];
    let spd = windMatch[2] || windMatch[5];
    let dirVal = (dir !== "VRB") ? parseInt(dir, 10) : 0;
    let spdVal = parseInt(spd, 10);

    updateEngineCellVal('landing', 'windDir', dirVal);
    updateEngineCellVal('landing', 'windSpeed', spdVal);

    let elDir = document.getElementById('ldg-wind-dir');
    let elSpd = document.getElementById('ldg-wind-spd');
    if (elDir) elDir.value = dirVal;
    if (elSpd) elSpd.value = spdVal;
  }

  const tempRegex = /\s(M?\d{2})\/(M?\d{2})\s/;
  const tempMatch = metarText.match(tempRegex);

  if (tempMatch) {
    let tempStr = tempMatch[1];
    if (tempStr.startsWith('M')) {
      tempStr = '-' + tempStr.substring(1);
    }
    let oatVal = parseInt(tempStr, 10);
    updateEngineCellVal('landing', 'oat', oatVal);
    let elOat = document.getElementById('ldg-oat');
    if (elOat) elOat.value = oatVal;
  }

  const qnhRegex = /\bQ(\d{4})\b/i;
  const qnhMatch = metarText.match(qnhRegex);

  if (qnhMatch) {
    let qnhVal = parseInt(qnhMatch[1], 10);
    updateEngineCellVal('landing', 'qnh', qnhVal);
    let elQnh = document.getElementById('ldg-qnh');
    if (elQnh) elQnh.value = qnhVal;
  } else {
    const altRegex = /\bA(\d{4})\b/i;
    const altMatch = metarText.match(altRegex);
    if (altMatch) {
      let hpa = Math.round(parseInt(altMatch[1], 10) * 0.338639);
      updateEngineCellVal('landing', 'qnh', hpa);
      let elQnh = document.getElementById('ldg-qnh');
      if (elQnh) elQnh.value = hpa;
    }
  }

  if (typeof refreshOutputs === 'function') {
    refreshOutputs();
  }
}
