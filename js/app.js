let hfInstance;
let globalData = { airports: [], factors: {} };

const CELL_MAPPING = {
  airport: {
    sheetName: 'Airport data',
    startRow: 4,
    codeCol: 0 // Kolumn A (0-indexerat i JSON)
  },
  takeoff: {
    sheetName: 'Take-off',
    inputs: {
      'to-metar': 'C5',
      airportAndRwy: 'C4',
      windDirOverride: 'E6',
      windSpeedOverride: 'E7',
      oatOverride: 'E8',
      qnhOverride: 'E9',
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
      windDirOverride: 'E6',
      windSpeedOverride: 'E7',
      oatOverride: 'E8',
      qnhOverride: 'E9',
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

// 1. Huvudfunktion som kör igång allt i rätt ordning
async function init() {
  try {
    console.log("Startar PWA och laddar data...");
    
    // Ladda in Excel och skapa HyperFormula-instansen
    globalData = await loadData(); 
    
    // Fyll rullistor och koppla eventlyssnare
    populateAirportSelects();
    setupEventListeners();
    
    // Registrera Service Worker för offline-stöd
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js')
        .then(() => console.log("Service Worker registrerad!"))
        .catch(err => console.log('SW error:', err));
    }
    
    console.log("Appen är helt initierad!");
  } catch (error) {
    console.error("Kunde inte slutföra init():", error);
  }
}

// 2. Ladda Excel-filen
async function loadData() {
  console.log("1. loadData har startat!");
  try {
    const basePath = window.location.hostname.includes('github.io') 
      ? '/Beechcraft-Performance-EFB/data/be200_prestanda.xlsx' 
      : 'data/be200_prestanda.xlsx';

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
    
    populateAirportsFromRaw(sheetsData['Airport data']);
    refreshOutputs();
    console.log("be200_prestanda.xlsx har lästs in i HyperFormula!");
    
    return sheetsData;
  } catch (error) {
    console.error("Fel vid inläsning av Excel-fil:", error);
    throw error;
  }
}

// 3. Dummy för eventlyssnare så den inte kraschar
function setupEventListeners() {
  // Lägg till eventlyssnare här om det behövs
}

function setupAirportSelects() {
  // Komplettera om du har en separat funktion för rullistorna
}

function populateAirportSelects() {
  // Kan anropas från init
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
  
  if (event && event.currentTarget) {
    event.currentTarget.classList.add('active');
    event.currentTarget.style.background = '#21262d';
    event.currentTarget.style.color = '#fff';
  }
}

// Fyll rullistor direkt från rådata-arrayen
function populateAirportsFromRaw(rows) {
  let optionsHtml = '<option value="">Choose airport and RWY</option>';

  if (rows && Array.isArray(rows)) {
    rows.forEach((row, index) => {
      if (index < 4) return;
      const codeVal = row[0];
      if (codeVal && codeVal !== 'Airport' && codeVal !== '[ft]') {
        optionsHtml += `<option value="${codeVal}">${codeVal}</option>`;
      }
    });
  }

  const savedToAirport = localStorage.getItem('selected_to_airport');
  if (savedToAirport) {
    const toSelect = document.getElementById('to-airport');
    if (toSelect) {
      toSelect.value = savedToAirport;
      handleTakeoffAirport(savedToAirport);
    }
  }

  const savedLdgAirport = localStorage.getItem('selected_ldg_airport');
  if (savedLdgAirport) {
    const ldgSelect = document.getElementById('ldg-airport');
    if (ldgSelect) {
      ldgSelect.value = savedLdgAirport;
      handleLandingAirport(savedLdgAirport);
    }
  }

  const toSelect = document.getElementById('to-airport');
  const ldgSelect = document.getElementById('ldg-airport');
  if (toSelect) toSelect.innerHTML = optionsHtml;
  if (ldgSelect) ldgSelect.innerHTML = optionsHtml;
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

function getOutputVal(sheetName, cellRef) {
  if (!hfInstance) return '-';
  if (!cellRef) return '-';
  try {
    const sheetId = hfInstance.getSheetId(sheetName);
    const pos = parseCellRef(cellRef);
    if (!pos) return '-';

    let val = hfInstance.getCellValue({ sheet: sheetId, col: pos.col, row: pos.row });
    if (typeof val === 'number') {
      val = Math.round(val);
    }

    return (val !== null && val !== undefined && val !== '') ? val : '-';
  } catch (e) {
    return '-';
  }
}

function handleTakeoffAirport(val) { 
  updateEngineCellVal('takeoff', 'airportAndRwy', val); 
  localStorage.setItem('selected_to_airport', val);
  if (val && val !== "") {
    fetchMetarForAirport('takeoff');
  }
}

function handleLandingAirport(val) { 
  updateEngineCellVal('landing', 'airportAndRwy', val); 
  localStorage.setItem('selected_ldg_airport', val);
  if (val && val !== "") {
    fetchMetarForAirport('landing');
  }
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
  safeSetText('check-tora-val-alt', getOutputVal(to.sheetName, to.outputs.tora));
  safeSetText('check-v1-val', getOutputVal(to.sheetName, to.outputs.v1));

  updateBadgeStatus('badge-tor', getOutputVal(to.sheetName, to.outputs.tor), getOutputVal(to.sheetName, to.outputs.tora), (a, b) => a <= b);
  updateBadgeStatus('badge-asd', getOutputVal(to.sheetName, to.outputs.asd), getOutputVal(to.sheetName, to.outputs.asda), (a, b) => a <= b);
  updateBadgeStatus('badge-tod', getOutputVal(to.sheetName, to.outputs.tod), getOutputVal(to.sheetName, to.outputs.tor), (a, b) => a <= b);

  safeSetText('res-ldg-lda', getOutputVal(ldg.sheetName, ldg.outputs.lda));
  safeSetText('res-ldg-hwtw', getOutputVal(ldg.sheetName, ldg.outputs.hwTw));
  safeSetText('res-ldg-xw', getOutputVal(ldg.sheetName, ldg.outputs.xw));
  safeSetText('res-ldg-xwlimit', getOutputVal(ldg.sheetName, ldg.outputs.xwLimit));
  safeSetText('res-ldg-missed', getOutputVal(ldg.sheetName, ldg.outputs.missedClimb));
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
window.handleTakeoffAirport = handleTakeoffAirport;
window.handleLandingAirport = handleLandingAirport;
window.handleTakeoffMass = handleTakeoffMass;
window.handleLandingMass = handleLandingMass;
window.handleTakeoffFlaps = handleTakeoffFlaps;
window.handleLandingFlaps = handleLandingFlaps;
window.handleWeather = handleWeather;
window.handleWeatherOverride = handleWeatherOverride;
window.handleManualWeatherInput = handleManualWeatherInput;
window.updateEngineCellVal = updateEngineCellVal;

document.addEventListener('DOMContentLoaded', init);

// Uppdaterad METAR-hämtning med färglogik (<35 min grön, 35-60 min amber, >60 min eller icao-fel röd)
async function fetchMetarForAirport(sheetType) {
  if (!hfInstance) return;
  
  const displaySpanId = sheetType === 'takeoff' ? 'to-metar-display' : 'ldg-metar-display';
  const displaySpan = document.getElementById(displaySpanId);
  
  try {
    const config = CELL_MAPPING[sheetType];
    const sheetId = hfInstance.getSheetId(config.sheetName);
    const pos = parseCellRef(config.inputs.airportAndRwy);
    
    const airportCellVal = hfInstance.getCellValue({ sheet: sheetId, col: pos.col, row: pos.row });
    
    if (!airportCellVal || airportCellVal === '-') {
      if (displaySpan) {
        displaySpan.textContent = "-";
        displaySpan.style.color = "#8b949e";
      }
      return;
    }

    const icaoCode = airportCellVal.toString().trim().substring(0, 4).toUpperCase();
    if (icaoCode.length < 4) return;

    if (displaySpan) {
      displaySpan.textContent = "Hämtar METAR...";
      displaySpan.style.color = "#8b949e";
    }

    const scriptWebAppDataUrl = `https://script.google.com/macros/s/AKfycbzfUIgEmCV4kCVnD1hK6rD8aWnurtyNvQQt6towRzG6QWA07-0iRZ5aZ5ctJIhBY_98YA/exec?icao=${encodeURIComponent(icaoCode)}`;
    
    const response = await fetch(scriptWebAppDataUrl);
    if (!response.ok) throw new Error(`Kunde inte hämta via Apps Script (status: ${response.status})`);
    
    let metarText = await response.text();
    metarText = metarText ? metarText.trim() : "";
    
    if (metarText && !metarText.includes("INGEN METAR") && !metarText.includes("OFFLINE")) {
      const matchesIcao = metarText.toUpperCase().includes(icaoCode);
      
      let reportAgeMinutes = 0;
      const timeMatch = metarText.match(/\b\d{2}(\d{2})(\d{2})Z\b/);
      if (timeMatch) {
        const reportHour = parseInt(timeMatch[1], 10);
        const reportMinute = parseInt(timeMatch[2], 10);
        const now = new Date();
        const reportDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), reportHour, reportMinute));
        reportAgeMinutes = (now - reportDate) / (1000 * 60);
        if (reportAgeMinutes < 0) reportAgeMinutes += 24 * 60;
      }

      metarText = metarText.replace(/^METAR\s+/, "");
      
      const metarFieldKey = sheetType === 'takeoff' ? 'to-metar' : 'ldg-metar';
      updateEngineCellVal(sheetType, metarFieldKey, metarText);
      
      if (displaySpan) {
        displaySpan.textContent = metarText;
        
        if (!matchesIcao || reportAgeMinutes > 60) {
          displaySpan.style.color = "#f85149";
        } else if (reportAgeMinutes >= 35) {
          displaySpan.style.color = "#d29922";
        } else {
          displaySpan.style.color = "#3fb950";
        }
      }
      
      if (sheetType === 'takeoff') {
        parseAndPopulateMetarData(metarText);
      }
    } else {
      const metarFieldKey = sheetType === 'takeoff' ? 'to-metar' : 'ldg-metar';
      updateEngineCellVal(sheetType, metarFieldKey, "INGEN METAR HITTADES");
      if (displaySpan) {
        displaySpan.textContent = "INGEN METAR HITTADES";
        displaySpan.style.color = "#f85149";
      }
    }

  } catch (error) {
    console.error("Fel vid hämtning av METAR:", error);
    if (displaySpan) {
      displaySpan.textContent = "Kunde inte hämta METAR";
      displaySpan.style.color = "#f85149";
    }
  }
}

function fetchMetarForSelectedAirport() {
  const activePage = document.querySelector('.page.active');
  const sheetType = (activePage && activePage.id === 'page-landing') ? 'landing' : 'takeoff';
  fetchMetarForAirport(sheetType);
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

document.getElementById('global-registration').addEventListener('change', (e) => {
  localStorage.setItem('selected_reg', e.target.value);
});

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

    const getPercent = (val) => {
        const num = parseFloat(val) || 0;
        const clamped = Math.min(Math.max(num / toraNum, 0), 1);
        return clamped * 100;
    };

    document.getElementById('tor-marker').style.left = getPercent(tor) + '%';
    document.getElementById('tod-marker').style.left = getPercent(tod) + '%';
    document.getElementById('asd-marker').style.left = getPercent(asd) + '%';

    document.getElementById('tor-marker').setAttribute('data-val', tor || 0);
    document.getElementById('tod-marker').setAttribute('data-val', tod || 0);
    document.getElementById('asd-marker').setAttribute('data-val', asd || 0);

    const toraLabel = document.getElementById('tora-label');
    if (toraLabel) {
        toraLabel.textContent = `TORA: ${toraNum} m`;
    }
}

function renderLandingChart(ldgDist, lda) {
    const ldaNum = parseFloat(lda) || 0;
    if (ldaNum <= 0) return;

    const getPercent = (val) => {
        const num = parseFloat(val) || 0;
        const clamped = Math.min(Math.max(num / ldaNum, 0), 1);
        return clamped * 100;
    };

    document.getElementById('ldg-dist-marker').style.left = getPercent(ldgDist) + '%';
    document.getElementById('ldg-dist-marker').setAttribute('data-val', ldgDist || 0);

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
        actualSpan.style.color = "#8b949e";
        reqSpan.style.color = "#fff";
        cardContainer.style.background = "#0d1117";
        cardContainer.style.borderColor = "#30363d";
        return;
    }

    actualSpan.textContent = actualNum.toFixed(1) + "%";
    reqSpan.textContent = reqNum.toFixed(1) + "%";

    if (reqNum > actualNum) {
        reqSpan.style.color = "#ffffff";
        cardContainer.style.background = "#3d1414";
        cardContainer.style.borderColor = "#f85149";
    } else {
        reqSpan.style.color = "#ffffff";
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
