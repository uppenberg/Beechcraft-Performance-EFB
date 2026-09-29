// Hämta METAR via en säker publik CORS-proxy / API
async function fetchMetarForAirport(icaoCode, sheetType) {
  if (!icaoCode || icaoCode.length < 4) return;
  const icao = icaoCode.substring(0, 4).trim().toUpperCase();
  
  // Använder en stabil publik endpoint för aviation weather
  const url = `https://aviationweather.gov/api/data/metar?ids=${encodeURIComponent(icao)}&format=raw`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Kunde inte nå vädertjänsten');
    
    let metarText = await response.text();
    metarText = metarText.trim().replace(/^METAR\s+/, "");

    if (metarText && metarText.length > 5) {
      const metarCell = sheetType === 'takeoff' ? document.getElementById('to-c5-cell') : document.getElementById('val-ldg-c5');
      if (metarCell) metarCell.innerText = metarText;

      parseMetarValues(metarText, sheetType);
    } else {
      setMetarStatus(sheetType, `METAR saknas för ${icao}`);
    }
  } catch (err) {
    console.warn("Kunde inte hämta METAR direkt (CORS/Nätverk):", err);
    
    // Fallback: Använd en alternativ CORS-proxy om direktanrop blockeras
    try {
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const proxyRes = await fetch(proxyUrl);
      if (proxyRes.ok) {
        const data = await proxyRes.json();
        let metarText = data.contents ? data.contents.trim().replace(/^METAR\s+/, "") : "";
        if (metarText) {
          const metarCell = sheetType === 'takeoff' ? document.getElementById('to-c5-cell') : document.getElementById('val-ldg-c5');
          if (metarCell) metarCell.innerText = metarText;
          parseMetarValues(metarText, sheetType);
          return;
        }
      }
    } catch (proxyErr) {
      console.warn("Proxy-fallback misslyckades också:", proxyErr);
    }

    setMetarStatus(sheetType, "OFFLINE / INGEN METAR");
  }
}

// Extrahera värden ur METAR-strängen (t.ex. 27006KT 11/05 Q1028)
function parseMetarValues(metar, sheetType) {
  // Vind (t.ex. 27006KT eller 27010G20KT)
  const windMatch = metar.match(/\b(\d{3}|VRB)(\d{2,3})G?(\d{2,3})?KT\b/);
  if (windMatch) {
    const windDir = windMatch[1] === 'VRB' ? '0' : windMatch[1];
    const windSpd = windMatch[2];
    
    const prefix = sheetType === 'takeoff' ? 'val-to-c' : 'val-ldg-c';
    const dirEl = document.getElementById(prefix + '6');
    const spdEl = document.getElementById(prefix + '7');
    
    const overrideDir = document.getElementById(sheetType === 'takeoff' ? 'in-to-e6' : 'in-ldg-e6');
    const overrideSpd = document.getElementById(sheetType === 'takeoff' ? 'in-to-e7' : 'in-ldg-e7');

    if (dirEl && (!overrideDir || !overrideDir.value)) dirEl.innerText = windDir;
    if (spdEl && (!overrideSpd || !overrideSpd.value)) spdEl.innerText = windSpd;
  }

  // Temperatur (t.ex. 11/05 eller M02/M05)
  const tempMatch = metar.match(/\b(M?\d{2})\/(M?\d{2})\b/);
  if (tempMatch) {
    let temp = tempMatch[1].replace('M', '-');
    const prefix = sheetType === 'takeoff' ? 'val-to-c' : 'val-ldg-c';
    const tempEl = document.getElementById(prefix + '8');
    const overrideTemp = document.getElementById(sheetType === 'takeoff' ? 'in-to-e8' : 'in-ldg-e8');
    
    if (tempEl && (!overrideTemp || !overrideTemp.value)) {
      tempEl.innerText = parseInt(temp, 10);
    }
  }

  // QNH (t.ex. Q1028)
  const qnhMatch = metar.match(/\bQ(\d{4})\b/);
  if (qnhMatch) {
    const qnh = qnhMatch[1];
    const prefix = sheetType === 'takeoff' ? 'val-to-c' : 'val-ldg-c';
    const qnhEl = document.getElementById(prefix + '9');
    const overrideQnh = document.getElementById(sheetType === 'takeoff' ? 'in-to-e9' : 'in-ldg-e9');

    if (qnhEl && (!overrideQnh || !overrideQnh.value)) {
      qnhEl.innerText = qnh;
    }
  }
}

function setMetarStatus(sheetType, msg) {
  const metarCell = sheetType === 'takeoff' ? document.getElementById('to-c5-cell') : document.getElementById('val-ldg-c5');
  if (metarCell) metarCell.innerText = msg;
}
