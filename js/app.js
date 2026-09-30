// Global HyperFormula-instans
let hfInstance;

// Mappningstabell som kopplar PWA mot ark och exakta celler
const CELL_MAPPING = {
  airport: {
    sheetName: 'Airport Data',
    startRow: 6,
    codeCol: 'B', // Kolumn för ICAO/Flygplatskod
    nameCol: 'C'  // Kolumn för ban-/flygplatsnamn
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
      flaps: 'C26' // Exempelcell för flaps på start
    },
    outputs: {
      v1: 'C38',
      vr: 'C39',
      v2: 'C40',
      tod: 'C36'
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
      mass: 'C11'
    },
    outputs: {
      vrefUp: 'C26',
      ldgDistUp: 'C27'
    }
  }
};

// Initialisera HyperFormula med dina flikar
document.addEventListener('DOMContentLoaded', () => {
  const sheetsData = {
    'Airport Data': [
      ["ICAO", "Bana", "Elev", "Length"],
      ["ESNS", "Bana 12", "215", "1999"],
      ["ESPA", "Bana 10", "105", "2500"],
      ["ESSA", "Bana 08L", "148", "3300"]
    ],
    'Take-off': [
      /* Här laddas ditt faktiska kalkylblads formler/data */
    ],
    'Landing': [
      /* Här laddas ditt faktiska kalkylblads formler/data */
    ]
  };

  // Skapa HyperFormula-motorn
  hfInstance = HyperFormula.buildFromSheets(sheetsData, { licenseKey: 'gpl-v3' });

  // Fyll rullistor för flygplatser
  populateAirports();
  
  // Kör första uppdateringen av gränssnittet
  refreshOutputs();
});

// Byt mellan flikar i gränssnittet
function switchTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
  
  if (tabName === 'takeoff') {
    document.getElementById('page-takeoff').classList.add('active');
    document.event?.target?.classList.add('active'); // Säkerhetskontroll
  } else {
    document.getElementById('page-landing').classList.add('active');
  }
  // Aktivera knappvisuellt
  event.currentTarget.classList.add('active');
}

// Fyll flygplatsrullistor från "Airport Data"-fliken
function populateAirports() {
  const config = CELL_MAPPING.airport;
  let row = config.startRow;
  let optionsHtml = '<option value="">Välj flygplats/bana...</option>';

  while (true) {
    const codeAddr = hfInstance.detailedCellAddressFromString(`${config.sheetName}!${config.codeCol}${row}`);
    const codeVal = hfInstance.getCellValue(codeAddr);

    if (codeVal === null || codeVal === "") break;

    const nameAddr = hfInstance.detailedCellAddressFromString(`${config.sheetName}!${config.nameCol}${row}`);
    const nameVal = hfInstance.getCellValue(nameAddr) || "";

    optionsHtml += `<option value="${codeVal}">${codeVal} - ${nameVal}</option>`;
    row++;
  }

  document.getElementById('to-airport').innerHTML = optionsHtml;
  document.getElementById('ldg-airport').innerHTML = optionsHtml;
}

// Generell funktion för att skriva ett värde till motorn
function updateEngineCellVal(sheetType, fieldKey, value) {
  const config = CELL_MAPPING[sheetType];
  if (!config) return;
  const cellRef = config.inputs[fieldKey];
  if (!cellRef) return;

  const address = hfInstance.detailedCellAddressFromString(`${config.sheetName}!${cellRef}`);
  hfInstance.setCellContents(address, [[value]]);
  
  refreshOutputs();
}

// Specifika inmatningshanterare
function handleTakeoffAirport(val) {
  updateEngineCellVal('takeoff', 'airportAndRwy', val);
}

function handleLandingAirport(val) {
  updateEngineCellVal('landing', 'airportAndRwy', val);
}

function handleTakeoffMass(val) {
  document.getElementById('to-mass-val').innerText = val;
  updateEngineCellVal('takeoff', 'mass', Number(val));
}

function handleLandingMass(val) {
  document.getElementById('ldg-mass-val').innerText = val;
  updateEngineCellVal('landing', 'mass', Number(val));
}

function handleTakeoffFlaps(val) {
  updateEngineCellVal('takeoff', 'flaps', val);
}

function handleLandingFlaps(val) {
  // Styrs via logik för UP/DOWN beroende på din uppsättning i arket
  updateEngineCellVal('landing', 'flaps', val);
}

function handleWeather(sheetType, param, val) {
  // Skriver till C-cellen (automatisk data / basvärde)
  updateEngineCellVal(sheetType, param, val === "" ? "" : Number(val));
}

function handleWeatherOverride(sheetType, paramOverrideKey, val) {
  // Skriver till E-cellen (override)
  updateEngineCellVal(sheetType, paramOverrideKey, val === "" ? "" : Number(val));
}

// Hämtar beräknade värden från motorn och uppdaterar skärmen
function refreshOutputs() {
  if (!hfInstance) return;

  // Take-off outputs
  const toConfig = CELL_MAPPING.takeoff;
  document.getElementById('res-to-v1').innerText = hfInstance.getCellValue(hfInstance.detailedCellAddressFromString(`${toConfig.sheetName}!${toConfig.outputs.v1}`)) ?? '-';
  document.getElementById('res-to-vr').innerText = hfInstance.getCellValue(hfInstance.detailedCellAddressFromString(`${toConfig.sheetName}!${toConfig.outputs.vr}`)) ?? '-';
  document.getElementById('res-to-v2').innerText = hfInstance.getCellValue(hfInstance.detailedCellAddressFromString(`${toConfig.sheetName}!${toConfig.outputs.v2}`)) ?? '-';
  document.getElementById('res-to-tod').innerText = hfInstance.getCellValue(hfInstance.detailedCellAddressFromString(`${toConfig.sheetName}!${toConfig.outputs.tod}`)) ?? '-';

  // Landing outputs
  const ldgConfig = CELL_MAPPING.landing;
  document.getElementById('res-ldg-vref').innerText = hfInstance.getCellValue(hfInstance.detailedCellAddressFromString(`${ldgConfig.sheetName}!${ldgConfig.outputs.vrefUp}`)) ?? '-';
  document.getElementById('res-ldg-dist').innerText = hfInstance.getCellValue(hfInstance.detailedCellAddressFromString(`${ldgConfig.sheetName}!${ldgConfig.outputs.ldgDistUp}`)) ?? '-';
}
