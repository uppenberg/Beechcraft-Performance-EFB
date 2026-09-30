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
  // Komplettera om du har en separat funktion för rullistorna, eller använd populateAirportsFromRaw
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
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
  
  if (tabName === 'takeoff') {
    document.getElementById('page-takeoff').classList.add('active');
  } else {
    document.getElementById('page-landing').classList.add('active');
  }
  if (event && event.currentTarget) {
    event.currentTarget.classList.add('active');
  }
}

// Fyll rullistor direkt från rådata-arrayen
function populateAirportsFromRaw(rows) {
  let optionsHtml = '<option value="">Välj flygplats/bana...</option>';

  if (rows && Array.isArray(rows)) {
    rows.forEach((row, index) => {
      if (index < 4) return;
      const codeVal = row[0];
      if (codeVal && codeVal !== 'Airport' && codeVal !== '[ft]') {
        optionsHtml += `<option value="${codeVal}">${codeVal}</option>`;
      }
    });
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

    console.log(`Sätter ${config.sheetName} (${pos.col}, ${pos.row}) till:`, value);
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

    const val = hfInstance.getCellValue({ sheet: sheetId, col: pos.col, row: pos.row });
    return (val !== null && val !== undefined && val !== '') ? val : '-';
  } catch (e) {
    return '-';
  }
}

function handleTakeoffAirport(val) { updateEngineCellVal('takeoff', 'airportAndRwy', val); }
function handleLandingAirport(val) { updateEngineCellVal('landing', 'airportAndRwy', val); }

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

function refreshOutputs() {
  if (!hfInstance) return;
  console.log("refreshOutputs körs! Uppdaterar gränssnittet...");
  const to = CELL_MAPPING.takeoff;
  const ldg = CELL_MAPPING.landing;

  safeSetValue('to-wind-dir', getOutputVal(to.sheetName, to.inputs.windDir));
  safeSetValue('to-wind-spd', getOutputVal(to.sheetName, to.inputs.windSpeed));
  safeSetValue('to-oat', getOutputVal(to.sheetName, to.inputs.oat));
  safeSetValue('to-qnh', getOutputVal(to.sheetName, to.inputs.qnh));
  safeSetValue('to-metar', getOutputVal(to.sheetName, to.inputs['to-metar']));

  safeSetText('res-to-v1', getOutputVal(to.sheetName, to.outputs.v1));
  safeSetText('res-to-vr', getOutputVal(to.sheetName, to.outputs.vr));
  safeSetText('res-to-v2', getOutputVal(to.sheetName, to.outputs.v2));
  safeSetText('res-to-tod', getOutputVal(to.sheetName, to.outputs.tod));
  safeSetText('res-to-asd', getOutputVal(to.sheetName, to.outputs.asd));
  safeSetText('res-to-tora', getOutputVal(to.sheetName, to.outputs.tora));
  safeSetText('res-to-asda', getOutputVal(to.sheetName, to.outputs.asda));
  safeSetText('res-to-tor', getOutputVal(to.sheetName, to.outputs.tor));
  safeSetText('res-to-climb', getOutputVal(to.sheetName, to.outputs.climbGrad));
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

  safeSetText('res-ldg-lda', getOutputVal(ldg.sheetName, ldg.outputs.lda));
  safeSetText('res-ldg-hwtw', getOutputVal(ldg.sheetName, ldg.outputs.hwtw));
  safeSetText('res-ldg-xw', getOutputVal(ldg.sheetName, ldg.outputs.xw));
  safeSetText('res-ldg-xwlimit', getOutputVal(ldg.sheetName, ldg.outputs.xwLimit));
  safeSetText('res-ldg-missed', getOutputVal(ldg.sheetName, ldg.outputs.missedClimb));
  safeSetText('res-ldg-vrefup', getOutputVal(ldg.sheetName, ldg.outputs.vrefUp));
  safeSetText('res-ldg-distup', getOutputVal(ldg.sheetName, ldg.outputs.ldgDistUp));
  safeSetText('res-ldg-vrefdown', getOutputVal(ldg.sheetName, ldg.outputs.vrefDown));
  safeSetText('res-ldg-distdown', getOutputVal(ldg.sheetName, ldg.outputs.ldgDistDown));
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
window.updateEngineCellVal = updateEngineCellVal;

// Starta appen när DOM är redo
document.addEventListener('DOMContentLoaded', init);

async function fetchMetarForSelectedAirport() {
  if (!hfInstance) return;
  
  try {
    const toConfig = CELL_MAPPING.takeoff;
    const sheetId = hfInstance.getSheetId(toConfig.sheetName);
    const pos = parseCellRef(toConfig.inputs.airportAndRwy);
    
    const airportCellVal = hfInstance.getCellValue({ sheet: sheetId, col: pos.col, row: pos.row });
    
    if (!airportCellVal || airportCellVal === '-') {
      console.warn("Ingen flygplats vald i cell C4.");
      return;
    }

    const icaoCode = airportCellVal.toString().trim().substring(0, 4).toUpperCase();
    if (icaoCode.length < 4) return;

    console.log(`Hämtar METAR via eget Apps Script för: ${icaoCode}`);

    const scriptWebAppDataUrl = `https://script.google.com/macros/s/AKfycbzfUIgEmCV4kCVnD1hK6rD8aWnurtyNvQQt6towRzG6QWA07-0iRZ5aZ5ctJIhBY_98YA/exec?icao=${encodeURIComponent(icaoCode)}`;
    
    const response = await fetch(scriptWebAppDataUrl);
    
    if (!response.ok) {
      throw new Error(`Kunde inte hämta via Apps Script (status: ${response.status})`);
    }
    
    let metarText = await response.text();
    metarText = metarText ? metarText.trim() : "";
    
    if (metarText && !metarText.includes("INGEN METAR") && !metarText.includes("OFFLINE")) {
      // Rensa bort eventuell "METAR " i början
      metarText = metarText.replace(/^METAR\s+/, "");
      
      // 1. Spara rå METAR i C5
      updateEngineCellVal('takeoff', 'to-metar', metarText);
      console.log("METAR mottagen och inlagd i C5:", metarText);
      
      // 2. Extrahera och fyll i C6-C9 automatiskt
      parseAndPopulateMetarData(metarText);
      
    } else {
      updateEngineCellVal('takeoff', 'to-metar', metarText || "INGEN METAR HITTADES");
    }

  } catch (error) {
    console.error("Fel vid hämtning av METAR:", error);
    updateEngineCellVal('takeoff', 'to-metar', "OFFLINE / KUNDE INTE HÄMTA METAR");
  }
}

function parseAndPopulateMetarData(metarText) {
  if (!metarText || metarText.includes("INGEN METAR") || metarText.includes("OFFLINE")) {
    console.log("Parser avbryts: Ingen giltig METAR-text.");
    return;
  }

  console.log("--- START PARSERING ---", metarText);

  // 1. Parsa vind
  const windRegex = /(?:(\d{3}|VRB)(\d{2,3})(?:G(\d{2,3}))?KT|(\d{3}|VRB)(\d{2,3})(?:G(\d{2,3}))?MPS)/i;
  const windMatch = metarText.match(windRegex);

  if (windMatch) {
    let dir = windMatch[1] || windMatch[4];
    let spd = windMatch[2] || windMatch[5];
    let dirVal = (dir !== "VRB") ? parseInt(dir, 10) : 0;
    let spdVal = parseInt(spd, 10);

    console.log("Hittade vind:", dirVal, spdVal);

    updateEngineCellVal('takeoff', 'windDir', dirVal);
    updateEngineCellVal('takeoff', 'windSpeed', spdVal);

    let elDir = document.getElementById('to-wind-dir');
    let elSpd = document.getElementById('to-wind-spd');
    
    if (elDir) elDir.value = dirVal; else console.warn("Hittade inte element: to-wind-dir");
    if (elSpd) elSpd.value = spdVal; else console.warn("Hittade inte element: to-wind-spd");
  } else {
    console.warn("Kunde inte matcha vind i METAR.");
  }

  // 2. Parsa temperatur / OAT
  const tempRegex = /\s(M?\d{2})\/(M?\d{2})\s/;
  const tempMatch = metarText.match(tempRegex);

  if (tempMatch) {
    let tempStr = tempMatch[1];
    if (tempStr.startsWith('M')) {
      tempStr = '-' + tempStr.substring(1);
    }
    let oatVal = parseInt(tempStr, 10);
    
    console.log("Hittade OAT:", oatVal);

    updateEngineCellVal('takeoff', 'oat', oatVal);
    let elOat = document.getElementById('to-oat');
    if (elOat) elOat.value = oatVal; else console.warn("Hittade inte element: to-oat");
  } else {
    console.warn("Kunde inte matcha OAT i METAR.");
  }

  // 3. Parsa QNH
  const qnhRegex = /\bQ(\d{4})\b/i;
  const qnhMatch = metarText.match(qnhRegex);

  if (qnhMatch) {
    let qnhVal = parseInt(qnhMatch[1], 10);
    console.log("Hittade QNH:", qnhVal);

    updateEngineCellVal('takeoff', 'qnh', qnhVal);
    let elQnh = document.getElementById('to-qnh');
    if (elQnh) elQnh.value = qnhVal; else console.warn("Hittade inte element: to-qnh");
  } else {
    const altRegex = /\bA(\d{4})\b/i;
    const altMatch = metarText.match(altRegex);
    if (altMatch) {
      let hpa = Math.round(parseInt(altMatch[1], 10) * 0.338639);
      updateEngineCellVal('takeoff', 'qnh', hpa);
      let elQnh = document.getElementById('to-qnh');
      if (elQnh) elQnh.value = hpa;
    } else {
      console.warn("Kunde inte matcha QNH/Altimeter i METAR.");
    }
  }

  if (typeof refreshOutputs === 'function') {
    refreshOutputs();
  }
}
