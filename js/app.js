// Funktion för att ladda din .xlsx-fil till HyperFormula
async function loadExcelFile(fileOrUrl) {
  let data;
  if (typeof fileOrUrl === 'string') {
    // Om det är en sökväg/URL till filen på servern
    const response = await fetch(fileOrUrl);
    data = await response.arrayBuffer();
  } else {
    // Om det är från en filväljare (<input type="file">)
    data = await fileOrUrl.arrayBuffer();
  }

  const workbook = XLSX.read(data, { type: 'array', cellFormula: true, cellValue: true });
  
  // Bygg ett objekt som HyperFormula förstår utifrån Excel-arkens namn
  const sheetsData = {};
  workbook.SheetNames.forEach(sheetName => {
    const worksheet = workbook.Sheets[sheetName];
    // Konvertera arket till en 2D-array av formler/värden för HyperFormula
    sheetsData[sheetName] = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });
  });

  // Skapa eller ersätt HyperFormula-instansen med riktig data från filen
  hfInstance = HyperFormula.buildFromSheets(sheetsData, { licenseKey: 'gpl-v3' });

  // Uppdatera gränssnittet
  populateAirports();
  refreshOutputs();
  console.log("Excel-fil inläst i motorn!");
}
