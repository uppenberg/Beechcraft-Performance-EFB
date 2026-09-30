let hfInstance;

const CELL_MAPPING = {
  airport: {
    sheetName: 'Airport Data',
    startRow: 6,
    codeCol: 'B', 
    nameCol: 'C'  
  },
  takeoff: {
    sheetName: 'Take-off',
    inputs: {
      airportAndRwy: 'C4',
      windDir: 'C6',
      windDirOverride: 'E6',
      windSpeed: 'C7',
      windSpeedOverride: 'E7',
      oat: 'C8',
      oatOverride: 'E8',
      qnh: 'C9',
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
      escapeRoute: 'C70'
    }
  },
  landing: {
    sheetName: 'Landing',
    inputs: {
      airportAndRwy: 'C4',
      windDir: 'C6',
      windDirOverride: 'E6',
      windSpeed: 'C7',
      windSpeedOverride: 'E7',
      oat: 'C8',
      oatOverride: 'E8',
      qnh: 'C9',
      qnhOverride: 'E9',
      rwcc: 'C10',
      mass: 'C11',
      flaps: 'C-flaps'
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
      missedClimb: 'C31'
    }
  }
};

// Ladda Excel-filen automatiskt vid start
document.addEventListener('DOMContentLoaded', async () => {
  await loadExcelFile('data/be200_prestanda.xlsx');
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
      sheetsData[sheetName] = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });
    });

    hfInstance = HyperFormula.buildFromSheets(sheetsData, { licenseKey: 'gpl-v3' });
    
    populateAirports();
    refreshOutputs();
    console.log("be200_prestanda.xlsx har lästs in i HyperFormula!");
  } catch (error) {
    console.error("Fel vid inläsning av Excel-fil:", error);
    alert("Kunde inte läsa in 'data/be200_prestanda.xlsx'. Kontrollera att filen ligger på rätt plats och att du kör via en lokal server (t.ex. Live Server).");
  }
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

// Fyll flygplatsrullistor från "Airport Data"-fliken i Excel
function populateAirports() {
  if (!hfInstance) return;
  const config = CELL_MAPPING.airport;
  let row = config.startRow;
  let optionsHtml = '<option value="">Välj flygplats/bana...</option>';

  while (true) {
    try {
      const codeAddr = hfInstance.detailedCellAddressFromString(`${config.sheetName}!${config.codeCol}${row}`);
      const codeVal = hfInstance.getCellValue(codeAddr);

      if (codeVal === null || codeVal === "" || codeVal === undefined) break;

      const nameAddr = hfInstance.detailedCellAddressFromString(`${config.sheetName}!${config.nameCol}${row}`);
      const nameVal = hfInstance.getCellValue(nameAddr) || "";

      optionsHtml += `<option value="${codeVal}">${codeVal} - ${nameVal}</option>`;
      row++;
    } catch (e) {
      break; 
    }
  }

  const toSelect = document.getElementById('to-airport');
  const ldgSelect = document.getElementById('ldg-airport');
  if (toSelect) toSelect.innerHTML = optionsHtml;
  if (ldgSelect) ldgSelect.innerHTML = optionsHtml;
}

// Generell funktion för att skriva värde till motorn
function updateEngineCellVal(sheetType, fieldKey, value) {
  if (!hfInstance) return;
  const config = CELL_MAPPING[sheetType];
  if (!config) return;
  const cellRef = config.inputs[fieldKey];
  if (!cellRef) return;

  const address = hfInstance.detailedCellAddressFromString(`${config.sheetName}!${cellRef}`);
  hfInstance.setCellContents(address, [[value]]);
  
  refreshOutputs();
}

// Inmatningshanterare
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

// Hjälpfunktion för att hämta säkra värden
function getOutputVal(sheetName, cellRef) {
  if (!hfInstance) return '-';
  try {
    const val = hfInstance.getCellValue(hfInstance.detailedCellAddressFromString(`${sheetName}!${cellRef}`));
    return (val !== null && val !== undefined && val !== '') ? val : '-';
  } catch (e) {
    return '-';
  }
}

// Uppdatera samtliga outputs i gränssnittet
function refreshOutputs() {
  if (!hfInstance) return;

  // Take-off
  const to = CELL_MAPPING.takeoff;
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

  // Landing
  const ldg = CELL_MAPPING.landing;
  safeSetText('res-ldg-lda', getOutputVal(ldg.sheetName, ldg.outputs.lda));
  safeSetText('res-ldg-hwtw', getOutputVal(ldg.sheetName, ldg.outputs.hwTw));
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

// Exportera funktioner globalt så att HTML-elementen når dem
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
