let hfInstance = null;
let sheetNames = [];

async function initExcelEngine() {
  try {
    // 1. Hämta din Excel-fil från mappen /data/
    const response = await fetch('./data/be200_prestanda.xlsx');
    const arrayBuffer = await response.arrayBuffer();

    // 2. Använd SheetJS (XLSX) för att parsa filen till ett format HyperFormula förstår
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    // Konvertera workbook till ett objekt som HyperFormula kan köra
    const hyperFormulaData = {};
    workbook.SheetNames.forEach(name => {
      const sheet = workbook.Sheets[name];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false });
      hyperFormulaData[name] = jsonData;
    });

    // 3. Starta HyperFormula-motorn lokalt i webbläsaren
    hfInstance = HyperFormula.buildFromSheets(hyperFormulaData, {
      licenseKey: 'gpl-v3'
    });

    sheetNames = workbook.SheetNames;
    console.log("Excel-motor initierad lokalt med blad:", sheetNames);

    // Kör en första beräkning
    runExcelCalculations();

  } catch (err) {
    console.error("Kunde inte ladda Excel-motorn lokalt:", err);
  }
}

// Funktion för att skriva in värden i kalkylbladets celler och läsa ut resultat
function runExcelCalculations() {
  if (!hfInstance) return;

  // Exempel: Sätt värden i specifik cell på ett blad (t.ex. 'Takeoff'!C14 för vikt, C10 för RWCC)
  // Observera att tabellindex börjar på 0 (rad 0, kolumn 2 = C3)
  const takeoffSheetId = hfInstance.getSheetId('Takeoff'); // Byt till ditt exakta bladnamn
  
  if (takeoffSheetId !== undefined) {
    // Läs in värden från dina HTML-inputfält
    const mass = parseFloat(document.getElementById('in-to-c14')?.value) || 12500;
    const rwcc = parseInt(document.getElementById('in-to-c10')?.value) || 6;

    // Skriv till HyperFormula (exempelceller, justera efter ditt ark)
    // row, col, value (observera 0-indexering: rad 13 = 13, kolumn 2 = C)
    hfInstance.setCell ayrıcaValue({ sheet: takeoffSheetId, row: 13, col: 2 }, mass);
    hfInstance.setCellValues({ sheet: takeoffSheetId, row: 9, col: 2 }, rwcc);

    // Läs ut beräknat resultat från resultatceller i arket (t.ex. V1, TOR, TOD)
    const torResult = hfInstance.getCellValue({ sheet: takeoffSheetId, row: 20, col: 2 }); // Exempel cell
    
    // Uppdatera ditt UI med värdena direkt från Excel-motorn
    const distanceEl = document.getElementById('to-distance');
    if (distanceEl && torResult) {
      distanceEl.innerText = `${torResult}m`;
    }
  }
}
