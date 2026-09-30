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
    alert("Kunde inte läsa in 'data/be200_prestanda.xlsx'. Kontrollera att filen ligger på rätt plats.");
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
      break; // Bryt loopen om raden inte existerar
    }
  }

  document.getElementById('to-airport').innerHTML = optionsHtml;
  document.getElementById('ldg-airport').innerHTML = optionsHtml;
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
  document.getElementById('to-mass-val').innerText = val;
  updateEngineCellVal('takeoff', 'mass', Number(val));
}

function handleLandingMass(val) {
  document.getElementById('ldg-mass-val').innerText = val;
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
  document.getElementById('res-to-v1').innerText = getOutputVal(to.sheetName, to.outputs.v1);
  document.getElementById('res-to-vr').innerText = getOutputVal(to.sheetName, to.outputs.vr);
  document.getElementById('res-to-v2').innerText = getOutputVal(to.sheetName, to.outputs.v2);
  document.getElementById('res-to-tod').innerText = getOutputVal(to.sheetName, to.outputs.tod);
  document.getElementById('res-to-asd').innerText = getOutputVal(to.sheetName, to.outputs.asd);
  document.getElementById('res-to-tora').innerText = getOutputVal(to.sheetName, to.outputs.tora);
  document.getElementById('res-to-asda').innerText = getOutputVal(to.sheetName, to.outputs.asda);
  document.getElementById('res-to-tor').innerText = getOutputVal(to.sheetName, to.outputs.tor);
  document.getElementById('res-to-climb').innerText = getOutputVal(to.sheetName, to.outputs.climbGrad);
  document.getElementById('res-to-hwtw').innerText = getOutputVal(to.sheetName, to.outputs.hwTw);
  document.getElementById('res-to-xw').innerText = getOutputVal(to.sheetName, to.outputs.xw);
  document.getElementById('res-to-xwlimit').innerText = getOutputVal(to.sheetName, to.outputs.xwLimit);
  document.getElementById('res-to-g19').innerText = getOutputVal(to.sheetName, to.outputs.g19);
  document.getElementById('res-to-emup-vref').innerText = getOutputVal(to.sheetName, to.outputs.emUpVref);
  document.getElementById('res-to-emup-dist').innerText = getOutputVal(to.sheetName, to.outputs.emUpDist);
  document.getElementById('res-to-emdown-vref').innerText = getOutputVal(to.sheetName, to.outputs.emDownVref);
  document.getElementById('res-to-emdown-dist').innerText = getOutputVal(to.sheetName, to.outputs.emDownDist);
  document.getElementById('res-to-cloud').innerText = getOutputVal(to.sheetName, to.outputs.cloudBase);
  document.getElementById('res-to-escape').innerText = getOutputVal(to.sheetName, to.outputs.escapeRoute);

  // Landing
  const ldg = CELL_MAPPING.landing;
  document.getElementById('res-ldg-lda').innerText = getOutputVal(ldg.sheetName, ldg.outputs.lda);
  document.getElementById('res-ldg-hwtw').innerText = getOutputVal(ldg.sheetName, ldg.outputs.hwTw);
  document.getElementById('res-ldg-xw').innerText = getOutputVal(ldg.sheetName, ldg.outputs.xw);
  document.getElementById('res-ldg-xwlimit').innerText = getOutputVal(ldg.sheetName, ldg.outputs.xwLimit);
  document.getElementById('res-ldg-missed').innerText = getOutputVal(ldg.sheetName, ldg.outputs.missedClimb);
  document.getElementById('res-ldg-vrefup').innerText = getOutputVal(ldg.sheetName, ldg.outputs.vrefUp);
  document.getElementById('res-ldg-distup').innerText = getOutputVal(ldg.sheetName, ldg.outputs.ldgDistUp);
  document.getElementById('res-ldg-vrefdown').innerText = getOutputVal(ldg.sheetName, ldg.outputs.vrefDown);
  document.getElementById('res-ldg-distdown').innerText = getOutputVal(ldg.sheetName, ldg.outputs.ldgDistDown);
}
