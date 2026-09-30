let hfInstance;

const CELL_MAPPING = {
  airport: {
    sheetName: 'Airport data',
    startRow: 4,
    codeCol: 0 // Kolumn A (0-indexerat i JSON)
  },
  takeoff: {
    sheetName: 'Take-off',
    inputs: {
      airportAndRwy: 'C4',
      windDirOverride: 'E6',
      windSpeedOverride: 'E7',
      oatOverride: 'E8',
      qnhOverride: 'E9',
      rwcc: 'C10',
      contaminant: 'C11',
      antiIce: 'C13',
      mass: 'C14',
      flaps: 'C26'
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
      windDir: 'C6',
      windSpeed: 'C7',
      oat: 'C8',
      qnh: 'C9',

    }
  },
  landing: {
    sheetName: 'Landing',
    inputs: {
      airportAndRwy: 'C4',
      windDirOverride: 'E6',
      windSpeedOverride: 'E7',
      oatOverride: 'E8',
      qnhOverride: 'E9',
      rwcc: 'C10',
      mass: 'C11',
      flaps: 'G24'
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
      windDir: 'C6',
      windSpeed: 'C7',
      oat: 'C8',
      qnh: 'C9',
    }
  }
};

// Ladda Excel-filen automatiskt vid start
document.addEventListener('DOMContentLoaded', async () => {
  const basePath = window.location.hostname.includes('github.io') 
    ? '/Beechcraft-Performance-EFB/data/be200_prestanda.xlsx' 
    : 'data/be200_prestanda.xlsx';

  await loadExcelFile(basePath);
});

async function loadExcelFile(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Kunde inte hämta filen (${response.statusText})`);
    
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array', cellFormula: true, cellValue: true });
    
    const sheetsData = {};
    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      sheetsData[sheetName] = worksheetToHyperFormulaData(worksheet);
    });

    hfInstance = HyperFormula.buildFromSheets(sheetsData, { licenseKey: 'gpl-v3' });
    
    // Fyll rullistor direkt från rådatan för "Airport data"
    populateAirportsFromRaw(sheetsData['Airport data']);
    refreshOutputs();
    console.log("be200_prestanda.xlsx har lästs in i HyperFormula!");
  } catch (error) {
    console.error("Fel vid inläsning av Excel-fil:", error);
  }
}

// Convert a SheetJS worksheet without losing formulas or its original cell
// coordinates. sheet_to_json() returns cached/display values and can shift a
// sheet whose used range starts after A1, so HyperFormula cannot recalculate it.
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
      // HyperFormula does not support Excel's newer _xlfn functions (the
      // workbook uses them for METAR regex parsing). Keep Excel's cached value;
      // the corresponding weather fields can still overwrite these cells.
      rows[position.r][position.c] = cell.v ?? null;
    } else if (cell.f) {
      const formula = normalizeFormulaForHyperFormula(cell.f);
      rows[position.r][position.c] = `=${formula}`;
    } else if (cell.t === 'e') {
      // Preserve an Excel error as text instead of passing SheetJS's numeric
      // error code to HyperFormula.
      rows[position.r][position.c] = cell.w || null;
    } else {
      rows[position.r][position.c] = cell.v ?? null;
    }
  });

  return rows;
}

function normalizeFormulaForHyperFormula(formula) {
  // Excel serializes Boolean arguments as TRUE/FALSE, while HyperFormula
  // parses them as the functions TRUE()/FALSE().
  const normalizedBooleans = formula.replace(
    /\b(TRUE|FALSE)\b(?!\s*\()/gi,
    '$1()'
  );

  return normalizeHorizontalIndexCalls(normalizedBooleans);
}

// Excel allows INDEX(singleRowRange, columnNumber). HyperFormula interprets
// the second argument strictly as a row number, so make the row explicit:
// INDEX(singleRowRange, 1, columnNumber).
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
      // Excel escapes quotes by doubling them ("" in text, '' in sheet names).
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
      // Hoppa över de första rubrikraderna (index 0 till 3)
      if (index < 4) return;

      const codeVal = row[0]; // Kolumn A
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
// Hjälpfunktion för att konvertera Excel-kolumnbokstav till nummer (A=0, B=1, C=2 etc.)
function colLetterToIndex(letter) {
  let column = 0;
  for (let i = 0; i < letter.length; i++) {
    column += (letter.charCodeAt(i) - 64) * Math.pow(26, letter.length - i - 1);
  }
  return column - 1;
}

// Hjälpfunktion för att konvertera t.ex. "C4" till {col: 2, row: 3}
function parseCellRef(cellRef) {
  const match = cellRef.match(/^([A-Z]+)(\d+)$/);
  if (!match) return null;
  const col = colLetterToIndex(match[1]);
  const row = parseInt(match[2], 10) - 1; // 0-indexerat i HyperFormula
  return { col, row };
}

// Uppdaterad funktion för att skriva värde till motorn
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
    
    // <-- HÄR MÅSTE DETTA ANROP FINNAS!
    refreshOutputs();

  } catch (e) {
    console.error(`Fel vid uppdatering av cell ${fieldKey} på ${sheetType}:`, e);
  }
}

// Säkert hämta output-värde från angivet blad och cellreferens (t.ex. "C38")
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

// Inmatningshanterare
function handleTakeoffAirport(val) { updateEngineCellVal('takeoff', 'airportAndRwy', val); }
function handleLandingAirport(val) { updateEngineCellVal('landing', 'airportAndRwy', val); }

function handleTakeoffMass(val) {
  const span = document.getElementById('to-mass-val');
  if (span) span.innerText = val;

  // C494 and the result cells depend on C14 through workbook formulas.
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


// Uppdatera samtliga outputs i gränssnittet
function refreshOutputs() {
  if (!hfInstance) return;
  console.log("refreshOutputs körs! Uppdaterar gränssnittet...");
  const to = CELL_MAPPING.takeoff;
  const ldg = CELL_MAPPING.landing;
  // Deklarera 'to' HÖGST UPP innan den används
// Väderfält som läses från Excel (C6-C9)
  safeSetValue('to-wind-dir', getOutputVal(to.sheetName, to.outputs.windDir));
  safeSetValue('to-wind-spd', getOutputVal(to.sheetName, to.outputs.windSpeed));
  safeSetValue('to-oat', getOutputVal(to.sheetName, to.outputs.oat));
  safeSetValue('to-qnh', getOutputVal(to.sheetName, to.outputs.qnh));
  // Testa att logga vad getOutputVal faktiskt hittar för ASD
  // const asdVal = getOutputVal(to.sheetName, to.outputs.asd);
  // console.log("Hämtat ASD-värde från cell", to.outputs.asd, ":", asdVal);

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
