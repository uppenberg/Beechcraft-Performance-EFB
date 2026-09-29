let globalData = { airports: [], factors: {} };
let selectedRunwayData = null;

async function init() {
  console.log("Startar PWA...");
  try {
    globalData = await loadData();
    
    // Dölj laddningsmeddelandet direkt när data är laddad
    const loadingEl = document.getElementById('loading');
    if (loadingEl) loadingEl.style.display = 'none';

    // Visa takeoff-kpi blocket
    const kpiBlock = document.getElementById('to-kpi-block');
    if (kpiBlock) kpiBlock.style.display = 'grid';

    const chartBlock = document.getElementById('card-chart-block');
    if (chartBlock) chartBlock.style.display = 'block';

    populateAirportSelects();
    runCalculations();
  } catch (err) {
    console.error("Fel vid initiering:", err);
    const loadingEl = document.getElementById('loading');
    if (loadingEl) loadingEl.innerText = "Kunde inte ladda data. Kontrollera filerna.";
  }
}

function populateAirportSelects() {
  const selectTo = document.getElementById('in-to-c4');
  const selectLdg = document.getElementById('in-ldg-c4');
  if (!selectTo) return;

  selectTo.innerHTML = '';
  if (selectLdg) selectLdg.innerHTML = '';

  globalData.airports.forEach(airport => {
    airport.runways.forEach(rwy => {
      const val = `${airport.icao} RWY ${rwy.designator}`;
      const text = `${airport.icao} - ${airport.name} (RWY ${rwy.designator})`;
      
      selectTo.add(new Option(text, val));
      if (selectLdg) selectLdg.add(new Option(text, val));
    });
  });
}

function runCalculations() {
  const rwySelection = document.getElementById('in-to-c4')?.value;
  if (!rwySelection || !globalData.airports.length) return;

  const [icao, , rwyDesig] = rwySelection.split(' ');
  const airport = globalData.airports.find(a => a.icao === icao);
  if (!airport) return;
  selectedRunwayData = airport.runways.find(r => r.designator === rwyDesig) || airport.runways[0];

  const windDir = parseFloat(document.getElementById('in-to-e6')?.value || document.getElementById('val-to-c6')?.innerText) || 270;
  const windSpd = parseFloat(document.getElementById('in-to-e7')?.value || document.getElementById('val-to-c7')?.innerText) || 6;
  const rwcc = document.getElementById('in-to-c10')?.value || "6";
  const mass = parseFloat(document.getElementById('in-to-c14')?.value) || 12500;

  const wind = calculateWind(windDir, windSpd, selectedRunwayData.heading);
  const toResult = computeTakeoff(mass, rwcc, globalData.factors, selectedRunwayData, wind);

  // Uppdatera UI
  document.getElementById('val-v1').innerText = toResult.v1;
  document.getElementById('val-vr').innerText = toResult.vr;
  document.getElementById('val-v2').innerText = toResult.v2;
  document.getElementById('to-distance').innerText = `${toResult.tor}m`;
  
  const badge = document.getElementById('to-status-badge');
  if (badge) {
    badge.innerText = toResult.passed ? "OK" : "ÖVERSKRIDEN";
    badge.className = toResult.passed ? "badge-ok" : "badge-danger";
  }
}

window.addEventListener('DOMContentLoaded', init);
