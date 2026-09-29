let globalData = { airports: [], factors: {} };
let selectedRunwayData = null;

async function init() {
  globalData = await loadData();
  populateAirportSelects();
  setupEventListeners();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(err => console.log('SW error:', err));
  }
}

function populateAirportSelects() {
  const selectTo = document.getElementById('in-to-c4');
  const selectLdg = document.getElementById('in-ldg-c4');
  if (!selectTo) return;

  selectTo.innerHTML = '<option value="">-- Välj bana --</option>';
  if (selectLdg) selectLdg.innerHTML = '<option value="">-- Välj bana --</option>';

  globalData.airports.forEach(airport => {
    airport.runways.forEach(rwy => {
      const val = `${airport.icao} RWY ${rwy.designator}`;
      const text = `${airport.icao} - ${airport.name} (RWY ${rwy.designator})`;
      
      selectTo.add(new Option(text, val));
      if (selectLdg) selectLdg.add(new Option(text, val));
    });
  });
}

function setupEventListeners() {
  const triggers = ['in-to-c4', 'in-to-c6', 'in-to-c7', 'in-to-c10', 'in-to-c14'];
  triggers.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', runCalculations);
  });
}

function runCalculations() {
  const rwySelection = document.getElementById('in-to-c4').value;
  if (!rwySelection) return;

  const [icao, , rwyDesig] = rwySelection.split(' ');
  const airport = globalData.airports.find(a => a.icao === icao);
  if (!airport) return;
  selectedRunwayData = airport.runways.find(r => r.designator === rwyDesig);

  const windDir = parseFloat(document.getElementById('in-to-c6')?.value) || 0;
  const windSpd = parseFloat(document.getElementById('in-to-c7')?.value) || 0;
  const rwcc = document.getElementById('in-to-c10')?.value || "6";
  const mass = parseFloat(document.getElementById('in-to-c14')?.value) || 12500;

  const wind = calculateWind(windDir, windSpd, selectedRunwayData.heading);
  const toResult = computeTakeoff(mass, rwcc, globalData.factors, selectedRunwayData, wind);

  // Uppdatera gränssnittet direkt med lokala resultat
  document.getElementById('val-v1').innerText = toResult.v1;
  document.getElementById('val-vr').innerText = toResult.vr;
  document.getElementById('val-v2').innerText = toResult.v2;
  document.getElementById('to-distance').innerText = `${toResult.tor}m`;
  document.getElementById('to-status-badge').innerText = toResult.passed ? "OK" : "EJ GODKÄND";
  document.getElementById('to-status-badge').className = toResult.passed ? "badge-ok" : "badge-danger";
}

window.addEventListener('DOMContentLoaded', init);
