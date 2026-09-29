let globalData = { airports: [], factors: {} };
let selectedRunwayData = null;

async function init() {
  try {
    globalData = await loadData();
    
    document.getElementById('loading').style.display = 'none';
    document.getElementById('to-kpi-block').style.display = 'grid';
    document.getElementById('card-chart-block').style.display = 'block';

    populateAirportSelects();
    runCalculations();
  } catch (err) {
    console.error("Fel vid init:", err);
    document.getElementById('loading').innerText = "Kunde inte ladda data.";
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

  const windDir = parseFloat(document.getElementById('in-to-e6')?.value || 270);
  const windSpd = parseFloat(document.getElementById('in-to-e7')?.value || 6);
  const rwcc = document.getElementById('in-to-c10')?.value || "6";
  const mass = parseFloat(document.getElementById('in-to-c14')?.value) || 12500;
  const flaps = document.getElementById('in-to-c26')?.value || "UP";
  const contaminant = document.getElementById('in-to-c11')?.value || "No contaminant";

  // Sätt vind i UI
  document.getElementById('val-to-c6').innerText = windDir;
  document.getElementById('val-to-c7').innerText = windSpd;

  const wind = calculateWind(windDir, windSpd, selectedRunwayData.heading);
  const toResult = computeTakeoff(mass, rwcc, globalData.factors, selectedRunwayData, wind, flaps, contaminant);
  const ldgResult = computeLanding(mass, rwcc, globalData.factors, selectedRunwayData, wind, "DOWN");

  // Uppdatera V-speeds & Distans
  document.getElementById('val-v1').innerText = toResult.v1;
  document.getElementById('val-vr').innerText = toResult.vr;
  document.getElementById('val-v2').innerText = toResult.v2;
  document.getElementById('to-distance').innerText = `${toResult.tor}m`;
  
  // Stigning
  document.getElementById('to-climb').innerText = `${toResult.climbGrad}%`;

  // Vind / XW
  const hwTwStr = wind.hw >= 0 ? `HW+${wind.hw}` : `TW${Math.abs(wind.hw)}`;
  document.getElementById('to-wind-val').innerText = `${hwTwStr} | ${wind.xw}kt`;

  // Status Badge & EASA Checklist
  const todCard = document.getElementById('kpi-tod-card');
  const todStatusElem = document.getElementById('to-distance-status');
  if (toResult.passed) {
    todCard.className = "kpi-card alert-success";
    todStatusElem.innerHTML = `<span style="color: var(--success); font-weight: 800;">OK</span>`;
    document.getElementById('to-status-badge').innerText = "OK";
    document.getElementById('to-status-badge').className = "badge-ok";
  } else {
    todCard.className = "kpi-card alert-danger";
    todStatusElem.innerHTML = `<span style="color: var(--danger); font-weight: 800;">ÖVERSKRIDEN</span>`;
    document.getElementById('to-status-badge').innerText = "ÖVERSKRIDEN";
    document.getElementById('to-status-badge').className = "badge-danger";
  }

  // EASA Check-lista
  const easaContainer = document.getElementById('easa-compliance-details');
  if (easaContainer) {
    easaContainer.innerHTML = `
      <div style="font-weight: 700; margin-bottom: 4px; color: var(--muted);">EASA Performance Class A Criteria:</div>
      <div class="easa-item"><span>1. TOR (${toResult.tor}m) ≤ TORA (${selectedRunwayData.tora}m):</span><span class="${toResult.torOk ? 'easa-pass' : 'easa-fail'}">${toResult.torOk ? 'OK' : 'EJ OK'}</span></div>
      <div class="easa-item"><span>2. ASD (${toResult.asd}m) ≤ ASDA (${selectedRunwayData.asda}m):</span><span class="${toResult.asdOk ? 'easa-pass' : 'easa-fail'}">${toResult.asdOk ? 'OK' : 'EJ OK'}</span></div>
      <div class="easa-item"><span>3. TOD (${toResult.tod}m) ≤ TODA (${selectedRunwayData.toda}m):</span><span class="${toResult.todOk ? 'easa-pass' : 'easa-fail'}">${toResult.todOk ? 'OK' : 'EJ OK'}</span></div>
      <div class="easa-item"><span>4. Net Climb Gradient (${toResult.climbGrad}%) ≥ Min Req (${toResult.minClimbReq}%):</span><span class="${toResult.climbOk ? 'easa-pass' : 'easa-fail'}">${toResult.climbOk ? 'OK' : 'EJ OK'}</span></div>
    `;
  }

  // Uppdatera grafisk banprofil
  updateRunwayChart(toResult, selectedRunwayData);
}

function updateRunwayChart(res, rwy) {
  const maxLimit = Math.max(rwy.tora, rwy.asda, res.tor, res.tod, res.asd, 1000);
  document.getElementById('to-limit-label').innerText = `TORA: ${rwy.tora}m | ASDA: ${rwy.asda}m`;
  
  const torPct = Math.min(Math.round((res.tor / maxLimit) * 100), 100);
  const todPct = Math.min(Math.round((res.tod / maxLimit) * 100), 100);
  const asdPct = Math.min(Math.round((res.asd / maxLimit) * 100), 100);

  const mTor = document.getElementById('to-marker-tor');
  const mTod = document.getElementById('to-marker-tod');
  const mAsd = document.getElementById('to-marker-asd');

  if (mTor) { mTor.style.display = 'block'; mTor.style.left = `${torPct}%`; }
  if (mTod) { mTod.style.display = 'block'; mTod.style.left = `${todPct}%`; }
  if (mAsd) { mAsd.style.display = 'block'; mAsd.style.left = `${asdPct}%`; }

  document.getElementById('to-used-text').innerText = `TOR: ${res.tor}m | TOD: ${res.tod}m | ASD: ${res.asd}m`;
}

window.addEventListener('DOMContentLoaded', init);
