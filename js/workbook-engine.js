import { updateLandingOverweightWarning } from './aircraft-ui.js';
import { airportCellValue, getSelectedAirportRecord, scheduleTakeoffSuggestionRefresh, updateClimbPathLabel } from './airport-ui.js';
import { AppState, CELL_MAPPING, TAKEOFF_RESULT_COLUMN_BY_FLAPS, isC56xSelected } from './app-state.js';
import { renderEngineOutCard, scheduleMaxTakeoffMassUpdate, updateC56xEngineOutCard, updateC56xTakeoffFieldLength, updateMaxTakeoffMass } from './c56x-ui.js';
import { checkContaminationLogic, exceedsDistanceLimit, renderLandingChart, renderTakeoffChart, safeSetText, safeSetValue, updateBadgeStatus, updateClimbCheckCard, updateRunwayExceedanceCard, updateWindCheckCard, updateWindCheckCardLdg } from './results-ui.js';


// Workbook cell access and shared calculation outputs

export function colLetterToIndex(letter) {
  let column = 0;
  for (let i = 0; i < letter.length; i++) {
    column += (letter.charCodeAt(i) - 64) * Math.pow(26, letter.length - i - 1);
  }
  return column - 1;
}

export function parseCellRef(cellRef) {
  const match = cellRef.match(/^([A-Z]+)(\d+)$/);
  if (!match) return null;
  const col = colLetterToIndex(match[1]);
  const row = parseInt(match[2], 10) - 1;
  return { col, row };
}

export function setWorkbookCellValues(sheetId, updates) {
  if (!AppState.hfInstance || updates.length === 0) return;
  AppState.hfInstance.batch(() => {
    updates.forEach(({ position, value }) => {
      AppState.hfInstance.setCellContents(
        { sheet: sheetId, col: position.col, row: position.row },
        [[value]]
      );
    });
  });
}

export function updateEngineCellVal(sheetType, fieldKey, value) {
  if (!AppState.hfInstance) return;
  const config = CELL_MAPPING[sheetType];
  if (!config) return;
  const cellRef = config.inputs[fieldKey];
  if (!cellRef) return;

  try {
    const sheetId = AppState.hfInstance.getSheetId(config.sheetName);
    const pos = parseCellRef(cellRef);
    if (!pos) return;

    AppState.hfInstance.setCellContents({ sheet: sheetId, col: pos.col, row: pos.row }, [[value]]);
    refreshOutputs();
  } catch (e) {
    console.error(`Fel vid uppdatering av cell ${fieldKey} på ${sheetType}:`, e);
  }
}

export function updateEngineCellValues(sheetType, values) {
  if (!AppState.hfInstance) return;
  const config = CELL_MAPPING[sheetType];
  if (!config) throw new Error(`Unknown workbook sheet type: ${sheetType}`);

  const sheetId = AppState.hfInstance.getSheetId(config.sheetName);
  const updates = Object.entries(values).map(([fieldKey, value]) => {
    const cellRef = config.inputs[fieldKey];
    const position = cellRef ? parseCellRef(cellRef) : null;
    if (!position) throw new Error(`Invalid workbook input mapping: ${sheetType}.${fieldKey}`);
    return { position, value };
  });
  setWorkbookCellValues(sheetId, updates);
}

export function getOutputVal(sheetName, cellRef, roundNumber = true) {
  if (!AppState.hfInstance) return '-';
  if (!cellRef) return '-';
  try {
    const sheetId = AppState.hfInstance.getSheetId(sheetName);
    const pos = parseCellRef(cellRef);
    if (!pos) return '-';

    let val = AppState.hfInstance.getCellValue({ sheet: sheetId, col: pos.col, row: pos.row });
    if (roundNumber && typeof val === 'number') {
      val = Math.round(val);
    }

    return (val !== null && val !== undefined && val !== '') ? val : '-';
  } catch (e) {
    return '-';
  }
}

export function getTakeoffOutput(outputKey, roundNumber = true) {
  const config = CELL_MAPPING.takeoff;
  const cellRef = config.outputs[outputKey];
  if (!cellRef) return '-';

  const column = TAKEOFF_RESULT_COLUMN_BY_FLAPS[
    document.getElementById('to-flaps')?.value || 'UP'
  ];
  const selectedCellRef = ['tor', 'tod', 'asd', 'v1', 'vr', 'v2', 'climbGrad'].includes(outputKey)
    ? `${column || 'C'}${cellRef.match(/\d+$/)?.[0]}`
    : cellRef;
  return getOutputVal(config.sheetName, selectedCellRef, roundNumber);
}

export function updateMissedClimbCard(value) {
  const card = document.getElementById('kpi-missed-climb-card');
  const valueElement = document.getElementById('ldg-missed-climb');
  if (!card || !valueElement) return;

  const climbGradient = Number(value);
  if (value === '-' || !Number.isFinite(climbGradient)) {
    valueElement.textContent = '-- %';
    card.style.background = '#0d1117';
    card.style.borderColor = '#30363d';
    return;
  }

  valueElement.textContent = `${climbGradient.toFixed(1)} %`;
  const isBelowMinimum = climbGradient < 2.5;
  card.style.background = isBelowMinimum ? '#3d1414' : '#0d1117';
  card.style.borderColor = isBelowMinimum ? '#f85149' : '#30363d';
}

export function updateC56xLandingClimbCard(approachGradient, landingGradient) {
  const card = document.getElementById('kpi-missed-climb-card');
  if (!card) return;

  const rows = [
    { id: 'ldg-approach-climb', resultId: 'res-ldg-approach-climb', value: approachGradient, minimum: C56X_MIN_APPROACH_CLIMB_GRADIENT_PERCENT },
    { id: 'ldg-landing-climb', resultId: 'res-ldg-landing-climb', value: landingGradient, minimum: C56X_MIN_LANDING_CLIMB_GRADIENT_PERCENT },
  ];
  let isBelowMinimum = false;
  rows.forEach(({ id, resultId, value, minimum }) => {
    const available = Number.isFinite(value);
    const below = available && value < minimum;
    isBelowMinimum = isBelowMinimum || below;
    const text = available ? `${value.toFixed(1)} %` : '-- %';
    [id, resultId].forEach((elementId) => {
      const element = document.getElementById(elementId);
      if (!element) return;
      element.textContent = text;
      element.style.color = below ? '#ff7b72' : '#fff';
    });
  });
  card.style.background = isBelowMinimum ? '#3d1414' : '#0d1117';
  card.style.borderColor = isBelowMinimum ? '#f85149' : '#30363d';
}

export function updateC56xLanding() {
  if (!isC56xSelected() || typeof getC56xLandingPerformance !== 'function') return;

  const readNumber = (id) => {
    const raw = document.getElementById(id)?.value;
    return raw === undefined || String(raw).trim() === '' ? NaN : Number(raw);
  };
  const setText = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  };
  const formatDistance = (distanceFt) => {
    const feet = Math.ceil(distanceFt);
    const metres = Math.ceil(distanceFt * 0.3048);
    return `${feet.toLocaleString('en-US')} ft (${metres.toLocaleString('en-US')} m)`;
  };
  const weightLb = readNumber('ldg-mass');
  const antiIce = document.getElementById('ldg-anti-ice')?.value || 'OFF';
  const reverserStatus = document.getElementById('ldg-reversers')?.value || 'AVAILABLE';
  const runwayConditionCode = document.getElementById('ldg-rwcc')?.value;

  const overweight = updateLandingOverweightWarning();

  const airport = getSelectedAirportRecord('ldg');
  const fieldElevationFt = airportCellValue(airport?.['RWY Elev [ft] (B6)']);
  const runwayHeadingDeg = airportCellValue(airport?.['RWYHDG [°](H6)']);
  const runwaySlopePercent = airportCellValue(airport?.['Slope [%](G6)']);
  const ldaM = airportCellValue(airport?.['LDA [m](F6)']);
  const qnhHpa = readNumber('ldg-qnh');
  const oatC = readNumber('ldg-oat');
  const windSpeedKnots = readNumber('ldg-wind-spd');
  const windDirectionDeg = readNumber('ldg-wind-dir');

  const windInputsValid = Number.isFinite(runwayHeadingDeg) &&
    Number.isFinite(windSpeedKnots) && windSpeedKnots >= 0 &&
    (windSpeedKnots === 0 || Number.isFinite(windDirectionDeg));
  const windAngleRadians = windInputsValid
    ? (((windDirectionDeg - runwayHeadingDeg + 540) % 360) - 180) * Math.PI / 180
    : null;
  const headwindKnots = windInputsValid
    ? (windSpeedKnots === 0 ? 0 : windSpeedKnots * Math.cos(windAngleRadians))
    : null;
  const crosswindKnots = windInputsValid
    ? (windSpeedKnots === 0 ? 0 : Math.abs(windSpeedKnots * Math.sin(windAngleRadians)))
    : null;
  const crosswindLimitKnots = maxXwindByRCC.find(
    (entry) => entry.code === runwayConditionCode
  )?.max_XW ?? null;
  const formatKnots = (value) => Number.isFinite(value) ? String(Math.round(value)) : '-';
  updateWindCheckCardLdg(
    formatKnots(headwindKnots),
    formatKnots(crosswindKnots),
    formatKnots(crosswindLimitKnots)
  );
  setText('res-ldg-hwtw-kpi', formatKnots(headwindKnots));
  setText('res-ldg-xw-kpi', formatKnots(crosswindKnots));
  setText('res-ldg-xwlimit-kpi', formatKnots(crosswindLimitKnots));
  setText('res-ldg-lda', Number.isFinite(ldaM) ? String(Math.round(ldaM)) : '-');

  const status = document.getElementById('landing-exceedance-status');
  const distanceCard = document.getElementById('landing-exceedance-card');
  const maxWeightWarning = document.getElementById('ldg-max-weight-warning');
  const setUnavailable = (reason) => {
    if (status) status.textContent = reason;
    if (distanceCard) {
      distanceCard.classList.remove('is-exceeded', 'is-within-limits');
    }
    ['res-ldg-afm-distance', 'res-ldg-required-distance', 'res-ldg-max-weight',
      'res-ldg-vref', 'res-ldg-c56x-vref', 'res-ldg-c56x-vapp', 'res-ldg-vref-vapp'].forEach((id) => setText(id, '-'));
    setText('res-ldg-factor', '-');
    if (maxWeightWarning) maxWeightWarning.hidden = true;
    updateC56xLandingClimbCard(null, null);
    renderLandingChart(null, null, ldaM);
  };

  if (!airport) {
    setUnavailable('Select an airport and runway');
    return;
  }
  if (![fieldElevationFt, runwaySlopePercent, qnhHpa, oatC, weightLb].every(Number.isFinite) ||
      qnhHpa <= 0 || !windInputsValid) {
    setUnavailable('Enter QNH, OAT, wind and mass; runway needs elevation, heading and slope');
    return;
  }

  let performance = null;
  try {
    performance = getC56xLandingPerformance({
      qnhHpa,
      fieldElevationFt,
      oatC,
      weightLb,
      headwindKnots,
      runwaySlopePercent,
      runwayConditionCode,
      antiIce,
      reverserStatus,
    });
  } catch (error) {
    console.error('C56X landing calculation failed:', error);
    setUnavailable('Could not calculate landing performance');
    return;
  }

  const maxLandingWeight = performance.maxLandingWeight;
  const limitingWeightLb = maxLandingWeight.limitingLb;
  setText('res-ldg-max-weight-label', antiIce === 'ON'
    ? 'Max landing weight (lesser of Fig 4-42/4-43):'
    : 'Max landing weight (Fig 4-43):');
  setText('res-ldg-max-weight', Number.isFinite(limitingWeightLb)
    ? `${limitingWeightLb.toLocaleString('en-US')} lb` +
      (antiIce === 'ON'
        ? ` (4-42: ${Number.isFinite(maxLandingWeight.figure442Lb) ? maxLandingWeight.figure442Lb.toLocaleString('en-US') : 'N/A'} / 4-43: ${Number.isFinite(maxLandingWeight.figure443Lb) ? maxLandingWeight.figure443Lb.toLocaleString('en-US') : 'N/A'} lb)`
        : '')
    : '-');
  if (maxWeightWarning) {
    const exceedsLimit = Number.isFinite(limitingWeightLb) &&
      weightLb > limitingWeightLb && limitingWeightLb < C56X_MAX_DESIGN_LANDING_WEIGHT_LB;
    maxWeightWarning.hidden = !exceedsLimit;
    if (exceedsLimit) {
      maxWeightWarning.textContent = `Landing mass exceeds the maximum landing weight of ${limitingWeightLb.toLocaleString('en-US')} lb allowed by climb or brake energy limits. Burn off fuel prior to landing.`;
    }
    if (antiIce === 'ON' && maxLandingWeight.figure442Missing) {
      maxWeightWarning.hidden = false;
      maxWeightWarning.textContent = 'Figure 4-42 landing weight is unavailable for these altitude/temperature conditions. Do not use the Figure 4-43 limit alone.';
    } else if (!Number.isFinite(maxLandingWeight.figure443Lb)) {
      maxWeightWarning.hidden = false;
      maxWeightWarning.textContent = 'Figure 4-43 brake-energy landing weight is unavailable for these conditions. A maximum landing weight cannot be confirmed.';
    }
  }

  updateC56xLandingClimbCard(performance.approachClimbGradient, performance.landingClimbGradient);
  const formatLandingSpeed = (value) => Number.isFinite(value)
    ? `${Math.round(value)}`
    : '-';
  const vref = formatLandingSpeed(performance.vref);
  const vapp = formatLandingSpeed(performance.vapp);
  setText('res-ldg-vref', vref === '-' ? '-' : `${vref} KIAS`);
  setText('res-ldg-c56x-vref', vref === '-' ? '-' : `${vref} KIAS`);
  setText('res-ldg-c56x-vapp', vapp === '-' ? '-' : `${vapp} KIAS`);
  setText('res-ldg-vref-vapp', vref === '-' || vapp === '-'
    ? 'Outside AFM speed data'
    : `${vref} / ${vapp} KIAS`);
  setText('res-ldg-factor', performance.factor === null ? '-' : `x${performance.factor}`);

  if (performance.distanceFt === null || performance.requiredDistanceFt === null) {
    const reason = runwaySlopePercent < -2
      ? 'Runway slope below -2% is outside the AFM data'
      : headwindKnots < -10
        ? 'Tailwind above 10 kt is outside the AFM data'
        : 'Conditions are outside the AFM landing data';
    setText('res-ldg-afm-distance', '-');
    setText('res-ldg-required-distance', '-');
    if (status) status.textContent = reason;
    if (distanceCard) distanceCard.classList.remove('is-exceeded', 'is-within-limits');
    renderLandingChart(null, null, ldaM);
    return;
  }

  const requiredDistanceM = Math.ceil(performance.requiredDistanceFt * 0.3048);
  setText('res-ldg-afm-distance', formatDistance(performance.distanceFt));
  setText('res-ldg-required-distance', formatDistance(performance.requiredDistanceFt));
  const exceeded = exceedsDistanceLimit(requiredDistanceM, ldaM);
  if (status) {
    status.textContent = `LD ${requiredDistanceM.toLocaleString('en-US')} m · ` +
      (exceeded === null ? 'LDA unavailable' : exceeded ? 'Exceeds LDA' : 'Within limits');
  }
  if (distanceCard) {
    distanceCard.classList.toggle('is-exceeded', exceeded === true);
    distanceCard.classList.toggle('is-within-limits', exceeded === false);
  }
  renderLandingChart(requiredDistanceM, requiredDistanceM, ldaM);
}

export function handleTakeoffMass(val) {
  const span = document.getElementById('to-mass-val');
  if (span) span.innerText = val;
  updateEngineCellVal('takeoff', 'mass', Number(val));
  if (isC56xSelected()) {
    updateMaxTakeoffMass();
    updateC56xTakeoffFieldLength();
  }
}

export function handleLandingMass(val) {
  const span = document.getElementById('ldg-mass-val');
  if (span) span.innerText = val;
  updateEngineCellVal('landing', 'mass', Number(val));
  updateLandingOverweightWarning();
  if (isC56xSelected()) updateC56xLanding();
}

export function handleTakeoffFlaps(val) {
  updateEngineCellVal('takeoff', 'flaps', val);
  if (isC56xSelected()) {
    updateMaxTakeoffMass();
    updateC56xTakeoffFieldLength();
  }
}

export function handleTakeoffAntiIce(val) {
  updateEngineCellVal('takeoff', 'antiIce', val);
  if (isC56xSelected()) {
    updateMaxTakeoffMass();
    updateC56xTakeoffFieldLength();
  }
}

export function handleTakeoffReversers(val) {
  if (isC56xSelected()) {
    updateMaxTakeoffMass();
    updateC56xTakeoffFieldLength();
  }
}

export function isC56xDeiceFluidApplied() {
  return document.getElementById('to-deice')?.value === 'YES';
}

export function handleTakeoffDeice() {
  if (isC56xSelected()) {
    updateMaxTakeoffMass();
    updateC56xTakeoffFieldLength();
  }
}

export function handleTakeoffRwcc(val) {
  updateEngineCellVal('takeoff', 'rwcc', val);
  if (typeof refreshOutputs === 'function') refreshOutputs();
  if (isC56xSelected()) {
    updateMaxTakeoffMass();
    updateC56xTakeoffFieldLength();
  }
}

export function handleLandingFlaps() { refreshOutputs(); }

export function handleLandingAntiIce() {
  if (isC56xSelected()) updateC56xLanding();
}

export function handleLandingReversers() {
  if (isC56xSelected()) updateC56xLanding();
}

export function handleLandingRwcc(val) {
  updateEngineCellVal('landing', 'rwcc', val);
  if (isC56xSelected()) updateC56xLanding();
}

export function handleWeather(sheetType, param, val) {
  updateEngineCellVal(sheetType, param, val === "" ? "" : Number(val));
}

export function handleWeatherOverride(sheetType, paramOverrideKey, val) {
  updateEngineCellVal(sheetType, paramOverrideKey, val === "" ? "" : Number(val));
}

// Ny funktion för manuell väderinmatning med amber-styling
export function handleManualWeatherInput(sheetType, paramKey, inputElement) {
    const val = inputElement.value;

    if (paramKey === 'windSpeed') {
      // Number inputs can temporarily report an empty value while the user types
      // a minus sign. Keep the previous calculation until the entry is complete.
      if (inputElement.validity.badInput) return;

      if (val.trim() !== '' && Number(val) < 0) {
        inputElement.value = inputElement.dataset.lastValidValue ?? '';
        inputElement.setAttribute('aria-invalid', 'true');
        inputElement.title = 'Wind speed must be zero or greater.';
        inputElement.style.borderColor = '#f85149';
        inputElement.style.background = '#2a1010';
        return;
      }

      inputElement.dataset.lastValidValue = val;
      inputElement.removeAttribute('aria-invalid');
      if (inputElement.title === 'Wind speed must be zero or greater.') {
        inputElement.removeAttribute('title');
      }
    }

    if (val.trim() !== "") {
        inputElement.style.color = "#d29922";
        inputElement.style.borderColor = "#d29922";
        inputElement.style.background = "#221a05";
    } else {
        inputElement.style.color = "#fff";
        inputElement.style.borderColor = "#30363d";
        inputElement.style.background = "#0d1117";
    }

    updateEngineCellVal(sheetType, paramKey, val === "" ? "" : Number(val));
    if (sheetType === 'takeoff' &&
        isC56xSelected()) {
      updateMaxTakeoffMass();
      updateC56xTakeoffFieldLength();
    }
    if (sheetType === 'landing' && isC56xSelected()) updateC56xLanding();
}

export function refreshOutputs() {
  if (!AppState.hfInstance) {
    if (isC56xSelected()) {
      updateMaxTakeoffMass();
      updateC56xTakeoffFieldLength();
      updateC56xLanding();
    }
    return;
  }
  const to = CELL_MAPPING.takeoff;
  const ldg = CELL_MAPPING.landing;

  const v1Val = getTakeoffOutput('v1');
  safeSetText('check-v1-val', v1Val);

  const badgeV1 = document.getElementById('badge-v1');
  if (badgeV1) {
    if (v1Val !== '-' && v1Val !== null && v1Val !== undefined && !isNaN(Number(v1Val))) {
      badgeV1.innerText = "OK";
      badgeV1.style.background = "rgba(46, 160, 67, 0.15)";
      badgeV1.style.color = "#3fb950";
    } else {
      badgeV1.innerText = "FAIL";
      badgeV1.style.background = "rgba(248, 81, 73, 0.15)";
      badgeV1.style.color = "#f85149";
    }
  }

  const escapeVal = getOutputVal(to.sheetName, to.outputs.escapeRoute);
  if (isC56xSelected()) {
    updateC56xEngineOutCard(getSelectedAirportRecord('to'));
  } else {
    renderEngineOutCard(escapeVal);
  }

  const badgeMass = document.getElementById('badge-mass-limit');
  if (badgeMass) {
    const torVal = getTakeoffOutput('tor');
    const toraVal = getOutputVal(to.sheetName, to.outputs.tora);

    let isCheckOk = true;

    if (String(torVal).startsWith('#') || torVal === '-') {
      isCheckOk = false;
    } else {
      const tor = Number(torVal);
      const tora = Number(toraVal);
      if (!isNaN(tor) && !isNaN(tora) && tor > tora) {
        isCheckOk = false;
      }

      if (isCheckOk && !checkContaminationLogic()) {
        isCheckOk = false;
      }
    }

    if (isCheckOk) {
      badgeMass.innerText = "OK";
      badgeMass.style.background = "rgba(46, 160, 67, 0.15)";
      badgeMass.style.color = "#3fb950";
    } else {
      badgeMass.innerText = "FAIL";
      badgeMass.style.background = "rgba(248, 81, 73, 0.15)";
      badgeMass.style.color = "#f85149";
    }

  }
const hwTwValue = getOutputVal(to.sheetName, to.outputs.hwTw);
const xwValue = getOutputVal(to.sheetName, to.outputs.xw);
const xwLimitValue = getOutputVal(to.sheetName, to.outputs.xwLimit);
// Hämta värden för landning (anpassa efter dina egna output-nycklar i ldg)
const ldgHwTw = getOutputVal(ldg.sheetName, ldg.outputs.hwTw);
const ldgXw = getOutputVal(ldg.sheetName, ldg.outputs.xw);
const ldgXwLimit = getOutputVal(ldg.sheetName, ldg.outputs.xwLimit);

  // Kör vindkontrollen för landning
  updateWindCheckCardLdg(ldgHwTw, ldgXw, ldgXwLimit);
safeSetText('res-ldg-hwtw-kpi', ldgHwTw);
safeSetText('res-ldg-xw-kpi', ldgXw);
safeSetText('res-ldg-xwlimit-kpi', ldgXwLimit);

updateWindCheckCard(hwTwValue, xwValue, xwLimitValue);
  safeSetValue('to-wind-dir', getOutputVal(to.sheetName, to.inputs.windDir));
  safeSetValue('to-wind-spd', getOutputVal(to.sheetName, to.inputs.windSpeed));
  if (document.activeElement?.id !== 'to-oat') {
    safeSetValue('to-oat', getOutputVal(to.sheetName, to.inputs.oat));
  }
  safeSetValue('to-qnh', getOutputVal(to.sheetName, to.inputs.qnh));

  safeSetText('res-to-v1', getTakeoffOutput('v1'));
  safeSetText('res-to-vr', getTakeoffOutput('vr'));
  safeSetText('res-to-v2', getTakeoffOutput('v2'));
  safeSetText('res-to-tod', getTakeoffOutput('tod'));
  safeSetText('res-to-asd', getTakeoffOutput('asd'));
  safeSetText('res-to-tora', getOutputVal(to.sheetName, to.outputs.tora));
  safeSetText('res-to-asda', getOutputVal(to.sheetName, to.outputs.asda));
  safeSetText('res-to-tor', getTakeoffOutput('tor'));
  safeSetText('res-to-hwtw', getOutputVal(to.sheetName, to.outputs.hwTw));
  safeSetText('res-to-xw', getOutputVal(to.sheetName, to.outputs.xw));
  safeSetText('res-to-xwlimit', getOutputVal(to.sheetName, to.outputs.xwLimit));
  safeSetText('res-to-g19', getOutputVal(to.sheetName, to.outputs.req_climb_grad_to));
  safeSetText('res-to-emup-vref', getOutputVal(to.sheetName, to.outputs.emUpVref));
  safeSetText('res-to-emup-dist', getOutputVal(to.sheetName, to.outputs.emUpDist));
  safeSetText('res-to-emdown-vref', getOutputVal(to.sheetName, to.outputs.emDownVref));
  safeSetText('res-to-emdown-dist', getOutputVal(to.sheetName, to.outputs.emDownDist));
  safeSetText('res-to-escape', getOutputVal(to.sheetName, to.outputs.escapeRoute));

  // Climb OEI vs Req med 1 decimal och röd varning om req > oei
  const reqVal = getTakeoffOutput('climbGrad', false);
  const oeiVal = getOutputVal(to.sheetName, to.outputs.req_climb_grad_to, false);
  updateClimbCheckCard(reqVal, oeiVal);
  updateClimbPathLabel(null);

  safeSetText('check-tor-val', getTakeoffOutput('tor'));
  safeSetText('check-tora-val', getOutputVal(to.sheetName, to.outputs.tora));
  safeSetText('check-asd-val', getTakeoffOutput('asd'));
  safeSetText('check-asda-val', getOutputVal(to.sheetName, to.outputs.asda));
  safeSetText('check-tod-val', getTakeoffOutput('tod'));
  safeSetText('check-toda-val-alt', getOutputVal(to.sheetName, to.outputs.toda)); // Hämtar cell C21 (toda)
  safeSetText('check-v1-val', getTakeoffOutput('v1'));

  updateBadgeStatus('badge-tor', getTakeoffOutput('tor'), getOutputVal(to.sheetName, to.outputs.tora), (a, b) => a <= b);
  updateBadgeStatus('badge-asd', getTakeoffOutput('asd'), getOutputVal(to.sheetName, to.outputs.asda), (a, b) => a <= b);
  updateBadgeStatus('badge-tod', getTakeoffOutput('tod'), getOutputVal(to.sheetName, to.outputs.toda), (a, b) => a <= b); // Jämför TOD mot TODA

  updateRunwayExceedanceCard('takeoff-exceedance-card', 'takeoff-exceedance-status', [
    { label: 'TOR', distance: getTakeoffOutput('tor', false), limit: getOutputVal(to.sheetName, to.outputs.tora, false) },
    { label: 'TOD', distance: getTakeoffOutput('tod', false), limit: getOutputVal(to.sheetName, to.outputs.toda, false) },
    { label: 'ASD', distance: getTakeoffOutput('asd', false), limit: getOutputVal(to.sheetName, to.outputs.asda, false) },
  ]);

  safeSetText('res-ldg-lda', getOutputVal(ldg.sheetName, ldg.outputs.lda));
  safeSetText('res-ldg-hwtw', getOutputVal(ldg.sheetName, ldg.outputs.hwTw));
  safeSetText('res-ldg-xw', getOutputVal(ldg.sheetName, ldg.outputs.xw));
  safeSetText('res-ldg-xwlimit', getOutputVal(ldg.sheetName, ldg.outputs.xwLimit));
  safeSetText('res-ldg-missed', getOutputVal(ldg.sheetName, ldg.outputs.missedClimb));
  const missedClimbValue = getOutputVal(ldg.sheetName, ldg.outputs.missedClimb, false);
  updateMissedClimbCard(missedClimbValue);
  const landingFlaps = document.getElementById('ldg-flaps')?.value || 'DOWN';
  const landingVref = landingFlaps === 'UP'
    ? getOutputVal(ldg.sheetName, ldg.outputs.vrefUp)
    : getOutputVal(ldg.sheetName, ldg.outputs.vrefDown);
  safeSetText('res-ldg-vref', landingVref);
  safeSetText('res-ldg-vref-label', `VREF / FLAPS ${landingFlaps}`);
  safeSetText('res-ldg-vrefup', getOutputVal(ldg.sheetName, ldg.outputs.vrefUp));
  safeSetText('res-ldg-distup', getOutputVal(ldg.sheetName, ldg.outputs.ldgDistUp));
  safeSetText('res-ldg-vrefdown', getOutputVal(ldg.sheetName, ldg.outputs.vrefDown));
  safeSetText('res-ldg-distdown', getOutputVal(ldg.sheetName, ldg.outputs.ldgDistDown));
  const activeLandingDistance = landingFlaps === 'UP'
    ? getOutputVal(ldg.sheetName, ldg.outputs.ldgDistUp, false)
    : getOutputVal(ldg.sheetName, ldg.outputs.ldgDistDown, false);
  updateRunwayExceedanceCard('landing-exceedance-card', 'landing-exceedance-status', [
    { label: 'LD', distance: activeLandingDistance, limit: getOutputVal(ldg.sheetName, ldg.outputs.lda, false) },
  ]);

  renderTakeoffChart(
    getTakeoffOutput('tor', false),
    getTakeoffOutput('tod', false),
    getTakeoffOutput('asd', false),
    getOutputVal(to.sheetName, to.outputs.tora, false),
    getOutputVal(to.sheetName, to.outputs.toda, false),
    getOutputVal(to.sheetName, to.outputs.asda, false)
  );

  renderLandingChart(
    getOutputVal(ldg.sheetName, ldg.outputs.ldgDistUp, false),
    getOutputVal(ldg.sheetName, ldg.outputs.ldgDistDown, false),
    getOutputVal(ldg.sheetName, ldg.outputs.lda, false)
  );
  scheduleTakeoffSuggestionRefresh();
  scheduleMaxTakeoffMassUpdate();
}
