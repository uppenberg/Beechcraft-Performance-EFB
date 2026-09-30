// Utökad mappningstabell med samtliga outputs
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
      hwTw: 'C24',
      xw: 'C25',
      xwLimit: 'F25',
      tor: 'F21',
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

// Funktion för att säkert hämta värde från motorn
function getOutputVal(sheetName, cellRef) {
  if (!hfInstance) return '-';
  const val = hfInstance.getCellValue(hfInstance.detailedCellAddressFromString(`${sheetName}!${cellRef}`));
  return (val !== null && val !== undefined && val !== '') ? val : '-';
}

// Uppdaterad refresh-funktion som hämtar alla nya mätvärden till gränssnittet
function refreshOutputs() {
  if (!hfInstance) return;

  const toCfg = CELL_MAPPING.takeoff;
  // Take-off UI uppdatering
  document.getElementById('res-to-v1').innerText = getOutputVal(toCfg.sheetName, toCfg.outputs.v1);
  document.getElementById('res-to-vr').innerText = getOutputVal(toCfg.sheetName, toCfg.outputs.vr);
  document.getElementById('res-to-v2').innerText = getOutputVal(toCfg.sheetName, toCfg.outputs.v2);
  document.getElementById('res-to-tod').innerText = getOutputVal(toCfg.sheetName, toCfg.outputs.tod);
  document.getElementById('res-to-asd').innerText = getOutputVal(toCfg.sheetName, toCfg.outputs.asd);
  document.getElementById('res-to-climb').innerText = getOutputVal(toCfg.sheetName, toCfg.outputs.climbGrad);

  const ldgCfg = CELL_MAPPING.landing;
  // Landing UI uppdatering (exempel för UP / VREF)
  document.getElementById('res-ldg-vref').innerText = getOutputVal(ldgCfg.sheetName, ldgCfg.outputs.vrefUp);
  document.getElementById('res-ldg-dist').innerText = getOutputVal(ldgCfg.sheetName, ldgCfg.outputs.ldgDistUp);
}
