// Hämta METAR från aviationweather.gov direkt i klienten
async function fetchMetarForAirport(icaoCode, sheetType) {
  if (!icaoCode || icaoCode.length < 4) return;
  const icao = icaoCode.substring(0, 4).trim().toUpperCase();
  const url = `https://aviationweather.gov/api/data/metar?ids=${encodeURIComponent(icao)}&format=raw`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Kunde inte nå vädertjänsten');
    
    let metarText = await response.text();
    metarText = metarText.trim().replace(/^METAR\s+/, "");

    if (metarText) {
      // Sätt METAR-texten i UI
      const metarCell = sheetType === 'takeoff' ? document.getElementById('to-c5-cell') : document.getElementById('val-ldg-c5');
      if (metarCell) metarCell.innerText = metarText;

      // Enkel parsning av METAR-strängen för att extrakta vind, temp och QNH om fälten inte är överstyrda
      parseMetarValues(metarText, sheetType);
    } else {
      setMetarOfflineStatus(sheetType, "OFFLINE / INGEN METAR");
    }
  } catch (err) {
    console.warn("Kunde inte hämta METAR (offline-läge):", err);
    setMetarOfflineStatus(sheetType, "OFFLINE / KUNDE INTE HÄMTA METAR");
  }
}

// Extrahera värden ur METAR-strängen (t.ex. 27006KT 11/05 Q1028)
function parseMetarValues(metar, sheetType) {
  // Vind (t.ex. 27006KT eller VRB03KT)
  const windMatch = metar.match(/\b(\d{3}|VRB)(\d{2,3})G?(\d{2,3})?KT\b/);
  if (windMatch) {
    const windDir = windMatch[1] === 'VRB' ? '0' : windMatch[1];
    const windSpd = windMatch[2];
    
    const prefix = sheetType === 'takeoff' ? 'val-to-c' : 'val-ldg-c';
    const dirEl = document.getElementById(prefix + '6');
    const spdEl = document.getElementById(prefix + '7');
    
    if (dirEl && !document.getElementById(sheetType === 'takeoff' ? 'in-to-e6' : 'in-ldg-e6').value) dirEl.innerText = windDir;
    if (spdEl && !document.getElementById(sheetType === 'takeoff' ? 'in-to-e7' : 'in-ldg-e7').value) spdEl.innerText = windSpd;
  }

  // Temperatur / Daggpunkt (t.ex. 11/05 eller M02/M05)
  const tempMatch = metar.match(/\b(M?\d{2})\/(M?\d{2})\b/);
  if (tempMatch) {
    let temp = tempMatch[1].replace('M', '-');
    const prefix = sheetType === 'takeoff' ? 'val-to-c' : 'val-ldg-c';
    const tempEl = document.getElementById(prefix + '8');
    if (tempEl && !document.getElementById(sheetType === 'takeoff' ? 'in-to-e8' : 'in-ldg-e8').value) {
      tempEl.innerText = parseInt(temp, 10);
    }
  }

  // QNH (t.ex. Q1028 eller A2992)
  const qnhMatch = metar.match(/\bQ(\d{4})\b/);
  if (qnhMatch) {
    const qnh = qnhMatch[1];
    const prefix = sheetType === 'takeoff' ? 'val-to-c' : 'val-ldg-c';
    const qnhEl = document.getElementById(prefix + '9');
    if (qnhEl && !document.getElementById(sheetType === 'takeoff' ? 'in-to-e9' : 'in-ldg-e9').value) {
      qnhEl.innerText = qnh;
    }
  }
}

function setMetarOfflineStatus(sheetType, msg) {
  const metarCell = sheetType === 'takeoff' ? document.getElementById('to-c5-cell') : document.getElementById('val-ldg-c5');
  if (metarCell) metarCell.innerText = msg;
}
