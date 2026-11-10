import { airportCellValue, getC56xEngineOutClimbPath, getSelectedAirportRecord, updateClimbPathLabel, updateTakeoffAirportElevation } from './airport-ui.js';
import { AIRCRAFT_TYPE_BY_REGISTRATION, AppState, CELL_MAPPING } from './app-state.js';
import { checkContaminationLogic, finiteDistance, renderC56xTakeoffChart, safeSetText, updateClimbCheckCard, updateWindCheckCard } from './results-ui.js';
import { getOutputVal, getTakeoffOutput, parseCellRef } from './workbook-adapter.js';
import { readPerformanceInputs } from './performance-inputs.js';


// C56X performance calculations and presentation

let maxTakeoffMassTimer = null;
export function scheduleMaxTakeoffMassUpdate() {
  window.clearTimeout(maxTakeoffMassTimer);
  maxTakeoffMassTimer = window.setTimeout(() => {
    maxTakeoffMassTimer = null;
    updateMaxTakeoffMass();
  }, 120);
}

export function takeoffLimitsOk() {
  const to = CELL_MAPPING.takeoff;
  const within = (distance, limit) => {
    const d = finiteDistance(distance);
    const l = finiteDistance(limit);
    return d !== null && l !== null && d <= l;
  };
  if (!within(getTakeoffOutput('tor', false), getOutputVal(to.sheetName, to.outputs.tora, false))) return false;
  if (!within(getTakeoffOutput('asd', false), getOutputVal(to.sheetName, to.outputs.asda, false))) return false;
  if (!within(getTakeoffOutput('tod', false), getOutputVal(to.sheetName, to.outputs.toda, false))) return false;
  if (finiteDistance(getTakeoffOutput('v1', false)) === null) return false;
  if (!checkContaminationLogic()) return false;

  const actualClimb = finiteDistance(getTakeoffOutput('climbGrad', false));
  const requiredClimb = finiteDistance(getOutputVal(to.sheetName, to.outputs.req_climb_grad_to, false));
// Om någon av uppgifterna saknas kan vi inte garantera säkerheten -> underkänn
if (actualClimb === null || requiredClimb === null) {
  return false;
}
// Om det krävs mer än flygplanet klarar av -> underkänn
if (requiredClimb > actualClimb) {
  return false;
}
// Först om båda finns OCH flygplanet klarar kravet -> godkänn
return true;
}

export function updateC56xPerformanceCards({
  speeds = null,
  secondSegmentGradient = null,
  climbPath = null,
  requiredGradient = null,
  headwindKnots = null,
  crosswindKnots = null,
  crosswindLimitKnots = null,
} = {}) {
  const setText = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  };
  setText('res-to-v1', speeds ? Math.round(speeds.v1) : '-');
  setText('res-to-vr', speeds ? Math.round(speeds.vr) : '-');
  setText('res-to-v2', speeds ? Math.round(speeds.v2) : '-');
  updateClimbCheckCard(secondSegmentGradient, requiredGradient);
  updateClimbPathLabel(climbPath);
  updateWindCheckCard(
    headwindKnots,
    crosswindKnots,
    crosswindLimitKnots
  );
}

export function updateC56xTakeoffDistanceCard(
  distanceM,
  failedLimits = [],
  limitsAvailable = true,
  unavailableStatus = 'Awaiting performance',
  takeoffFactorBreakdown = null
) {
  const card = document.getElementById('takeoff-exceedance-card');
  const status = document.getElementById('takeoff-exceedance-status');
  if (!card || !status) return;
  if (!Number.isFinite(distanceM)) {
    status.textContent = unavailableStatus;
    const invalidConfig = unavailableStatus.includes('Invalid config');
    card.classList.toggle('is-exceeded', invalidConfig);
    card.classList.remove('is-within-limits');
    return;
  }
  const factorLabel = takeoffFactorBreakdown
    ? ` (${takeoffFactorBreakdown.performanceFactor.toFixed(2)} perf × ` +
      `${takeoffFactorBreakdown.rccFactor.toFixed(2)} RWCC × ` +
      `${takeoffFactorBreakdown.deiceFluidFactor.toFixed(2)} fluid = ` +
      `${takeoffFactorBreakdown.totalFactor.toFixed(2)})`
    : '';
  status.textContent = `TKOF ${distanceM.toLocaleString('en-US')} m${factorLabel} · ` +
    (failedLimits.length
      ? `Exceeds ${failedLimits.join(', ')}`
      : limitsAvailable ? 'Within limits' : 'Some runway limits unavailable');
  card.classList.toggle('is-exceeded', failedLimits.length > 0);
  card.classList.toggle('is-within-limits', failedLimits.length === 0 && limitsAvailable);
}

export function setC56xChecklistBadge(elementId, result) {
  const badge = document.getElementById(elementId);
  if (!badge) return;
  const styles = result === true
    ? { text: 'OK', background: 'rgba(46, 160, 67, 0.15)', color: '#3fb950' }
    : result === false
      ? { text: 'FAIL', background: 'rgba(248, 81, 73, 0.15)', color: '#f85149' }
      : { text: 'N/A', background: 'rgba(139, 148, 158, 0.15)', color: '#8b949e' };
  badge.textContent = styles.text;
  badge.style.background = styles.background;
  badge.style.color = styles.color;
}

export function getC56xV1CorrectionLabel(slopePercent, correctionKnots) {
  if (!Number.isFinite(slopePercent) || !Number.isFinite(correctionKnots)) {
    return 'V1 correction applied: unavailable';
  }
  const correction = `${correctionKnots > 0 ? '+' : ''}${Number(correctionKnots.toFixed(1))} kt`;
  const displayedSlope = Number(slopePercent.toFixed(2));
  if (Math.abs(slopePercent) < 0.000001) {
    return `V1 correction applied: ${correction} · level runway`;
  }
  if (slopePercent > 0) {
    const afmStep = [0.5, 1, 1.5, 2].find((step) => slopePercent <= step);
    if (!afmStep) return 'V1 correction unavailable · slope exceeds published range';
    return `V1 correction applied: ${correction} · ${displayedSlope}% uphill (AFM ${afmStep}% step)`;
  }
  const downhillSlope = Math.abs(slopePercent);
  if (downhillSlope < 1) {
    return `V1 correction applied: 0 kt · ${displayedSlope}% downhill (below 1%)`;
  }
  const afmStep = downhillSlope <= 1 ? 1 : 2;
  return `V1 correction applied: ${correction} · ${displayedSlope}% downhill (SHADED ${afmStep}% step)`;
}

export function getC56xWetRunwayMassLimit({
  qnhHpa,
  fieldElevationFt,
  oatC,
  windDirectionDeg,
  windSpeedKnots,
  runwayHeadingDeg,
  runwaySlopePercent,
  reverserStatus,
  antiIce,
  flaps,
  runwayLimitsM,
  runwayConditionCode = '5',
  deiceFluidApplied = readPerformanceInputs(document).takeoff.deice === 'YES',
}) {
  if (!runwayLimitsM.every(Number.isFinite)) return null;
  const slider = document.getElementById('to-mass');
  const minMass = Number(slider?.min);
  const maxMass = Number(slider?.max);
  const step = Number(slider?.step) || 50;
  if (!Number.isFinite(minMass) || !Number.isFinite(maxMass) || step <= 0) return null;

  const availableDistanceM = Math.min(...runwayLimitsM);
  for (let weightLb = maxMass; weightLb >= minMass; weightLb -= step) {
    const result = getC56xTakeoffFieldLengths({
      qnhHpa,
      fieldElevationFt,
      oatC,
      weightLb,
      windDirectionDeg,
      windSpeedKnots,
      runwayHeadingDeg,
      runwaySlopePercent,
      runwayConditionCode,
      reverserStatus,
      antiIce,
      flaps,
      deiceFluidApplied,
    });
    const requiredDistanceFt = result?.rccAdjustedDryDistanceFt;
    if (Number.isFinite(requiredDistanceFt) &&
        requiredDistanceFt * 0.3048 <= availableDistanceM) {
      return weightLb;
    }
  }
  return null;
}

// Shared by all models: the card is hidden when there is no routing text.
export function renderEngineOutCard(escapeVal) {
  const card = document.getElementById('card-engine-out');
  if (!card) return;
  const hasEscape = !(escapeVal === null || escapeVal === undefined ||
    String(escapeVal).trim() === '' || escapeVal === '-' ||
    (Number.isFinite(Number(escapeVal)) && Number(escapeVal) === 0));
  safeSetText('res-to-escape', escapeVal);
  card.hidden = false;
  card.style.display = hasEscape ? 'block' : 'none';
}

export function updateC56xEngineOutCard(airport) {
  renderEngineOutCard(airportCellValue(airport?.['Routing(L6)']) ?? '-');
}
export function updateC56xTakeoffFieldLength() {
  const card = document.getElementById('c56x-takeoff-distance-card');
  if (!card) return;

  const section = document.getElementById('c56x-takeoff-performance');
  const registration = document.getElementById('global-registration')?.value;
  if (AIRCRAFT_TYPE_BY_REGISTRATION[registration] !== 'C56X') {
    if (section) section.hidden = true;
    return;
  }
  if (section) section.hidden = false;
  updateC56xEngineOutCard(getSelectedAirportRecord('to'));

  const toraStatusElement = document.getElementById('c56x-tora-status');
  const todaStatusElement = document.getElementById('c56x-toda-status');
  const asdaStatusElement = document.getElementById('c56x-asda-status');
  const v1Element = document.getElementById('c56x-v1-check');
  const v1CorrectionElement = document.getElementById('c56x-v1-correction');
  const dryCompareElement = document.getElementById('c56x-compare-dry');
  const rccCompareElement = document.getElementById('c56x-compare-rcc');
  const massLimitLabelElement = document.getElementById('c56x-wet-mass-limit-label');
  const inputs = readPerformanceInputs(document).takeoff;
  const runwayConditionCode = inputs.rwcc;
  const antiIce = inputs.antiIce || 'OFF';
  const reverserStatus = inputs.reversers || 'AVAILABLE';
  const flaps = Number(inputs.flaps);
  const formatDistance = (distanceFt) => {
    const feet = Math.ceil(distanceFt);
    const metres = Math.ceil(distanceFt * 0.3048);
    return `${feet.toLocaleString('en-US')} ft (${metres.toLocaleString('en-US')} m)`;
  };
  const setDistanceComparison = (dryDistanceFt, rccDistanceFt, conditionCode) => {
    const dryAvailable = Number.isFinite(dryDistanceFt);
    const rccAvailable = Number.isFinite(rccDistanceFt);
    const dryIsSelected = conditionCode === '6' ||
      (dryAvailable && (!rccAvailable || dryDistanceFt >= rccDistanceFt));
    if (dryCompareElement) {
      dryCompareElement.textContent = dryAvailable
        ? formatDistance(dryDistanceFt)
        : 'Not available';
      dryCompareElement.style.fontWeight = dryAvailable && dryIsSelected ? '700' : '400';
    }
    if (rccCompareElement) {
      rccCompareElement.textContent = conditionCode === '6'
        ? 'Not applicable'
        : rccAvailable ? formatDistance(rccDistanceFt) : 'Not available';
      rccCompareElement.style.fontWeight =
        rccAvailable && conditionCode !== '6' &&
        (!dryAvailable || rccDistanceFt >= dryDistanceFt)
          ? '700'
          : '400';
    }
  };
  if (massLimitLabelElement) {
    massLimitLabelElement.firstChild.textContent = runwayConditionCode === '6'
        ? '5. Dry runway: '
        : '5. Wet/Contam runway mass limit check: Dry ';
  }
  const setUnavailable = (reason, resetPerformanceCards = true) => {
    if (toraStatusElement) toraStatusElement.textContent = 'Not available';
    if (todaStatusElement) todaStatusElement.textContent = 'Not available';
    if (asdaStatusElement) asdaStatusElement.textContent = 'Not available';
    if (v1Element) v1Element.textContent = 'Not available';
    if (v1CorrectionElement) v1CorrectionElement.textContent = 'V1 correction applied: unavailable';
    ['c56x-badge-tora', 'c56x-badge-toda', 'c56x-badge-asda',
      'c56x-badge-v1', 'c56x-badge-mass-limit'].forEach(
      (id) => setC56xChecklistBadge(id, null)
    );
    setDistanceComparison(null, null, runwayConditionCode);
    updateC56xTakeoffDistanceCard(null, [], true, reason);
    card.classList.add('is-exceeded');
    card.classList.remove('is-within-limits');
    renderC56xTakeoffChart(null, null, null, null);
    if (resetPerformanceCards) {
      updateC56xPerformanceCards();
    }
  };

  const airport = getSelectedAirportRecord('to');
  if (!airport) {
    setUnavailable('Select an airport and runway to calculate field length.');
    return;
  }

  const fieldElevationFt = airportCellValue(airport['RWY Elev [ft] (B6)']);
  const runwayHeadingDeg = airportCellValue(airport['RWYHDG [°](H6)']);
  const runwaySlopePercent = airportCellValue(airport['Slope [%](G6)']);
  const toraM = airportCellValue(airport['TORA [m] (C6)']);
  const todaM = airportCellValue(airport['TODA [m](D6)']);
  const asdaM = airportCellValue(airport['ASDA [m](E6)']);
  const qnhHpa = Number(inputs.qnh);
  const oatC = Number(inputs.oat);
  const windSpeedKnots = Number(inputs.windSpeed);
  const windDirectionDeg = Number(inputs.windDir);
  const weightLb = Number(inputs.mass);
  const requiredInputs = [
    fieldElevationFt,
    runwayHeadingDeg,
    runwaySlopePercent,
    qnhHpa,
    oatC,
    windSpeedKnots,
    weightLb,
  ];
  const windInputsValid = Number.isFinite(runwayHeadingDeg) &&
    Number.isFinite(windSpeedKnots) && windSpeedKnots >= 0 &&
    (windSpeedKnots === 0 ||
      (Number.isFinite(windDirectionDeg) &&
       inputs.windDir.trim()));
  const windAngleRadians = windInputsValid
    ? (((windDirectionDeg - runwayHeadingDeg + 540) % 360) - 180) * Math.PI / 180
    : null;
  const headwindKnots = windInputsValid ? windSpeedKnots * Math.cos(windAngleRadians) : null;
  const crosswindKnots = windInputsValid
    ? Math.abs(windSpeedKnots * Math.sin(windAngleRadians))
    : null;
  const crosswindLimitKnots = maxXwindByRCC.find(
    (entry) => entry.code === runwayConditionCode
  )?.max_XW ?? null;
  updateC56xPerformanceCards({ headwindKnots, crosswindKnots, crosswindLimitKnots });

  if (requiredInputs.some((value) => !Number.isFinite(value)) ||
      !inputs.qnh.trim() ||
      !inputs.oat.trim() ||
      !inputs.windSpeed.trim() ||
      qnhHpa <= 0 || windSpeedKnots < 0 ||
      (windSpeedKnots > 0 &&
        (!Number.isFinite(windDirectionDeg) ||
         !inputs.windDir.trim()))) {
    setUnavailable(
      'Enter valid QNH, OAT and wind values, and select a runway with elevation, heading and slope data.',
      false
    );
    return;
  }

  const supportedSetup = (flaps === 7 || flaps === 15) &&
    (antiIce === 'ON' || antiIce === 'OFF');
  let speeds = null;
  try {
    const pressureAltitudeFt = calculateC56xPressureAltitude(qnhHpa, fieldElevationFt);
    speeds = supportedSetup
      ? getC56xTakeoffSpeeds({
        pressureAltitudeFt,
        weightLb,
        oatC,
        headwindKnots,
        runwayConditionCode,
        runwaySlopePercent,
        reverserStatus,
        antiIce,
        flaps,
      })
      : null;
    const climbPath = getC56xEngineOutClimbPath(airport);
    const secondSegmentGradient = supportedSetup
      ? getC56xSecondSegmentClimbGradient({
        pressureAltitudeFt,
        weightLb,
        oatC,
        headwindKnots,
        flaps,
        antiIce,
        turningClimb: climbPath.turning,
      })
      : null;
    const requiredGradientValue = airportCellValue(airport['min climb gradient OEI(I6)']);
    updateC56xPerformanceCards({
      speeds,
      secondSegmentGradient,
      climbPath,
      requiredGradient: typeof requiredGradientValue === 'number'
        ? requiredGradientValue
        : null,
      headwindKnots,
      crosswindKnots,
      crosswindLimitKnots,
    });
  } catch (error) {
    console.error('C56X take-off speed, climb or wind calculation failed:', error);
    updateC56xPerformanceCards({ headwindKnots, crosswindKnots, crosswindLimitKnots });
  }

  if (!supportedSetup) {
    setUnavailable('C56X take-off charts are available only for Flaps 7° or 15°.', false);
    return;
  }

  if (!['1', '2', '3', '4', '5', '6'].includes(runwayConditionCode)) {
    setUnavailable(
      `C56X field-length charts are not available for RCC ${runwayConditionCode}.`,
      false
    );
    return;
  }

  let result;
  try {
    result = getC56xTakeoffFieldLengths({
      qnhHpa,
      fieldElevationFt,
      oatC,
      weightLb,
      windDirectionDeg,
      windSpeedKnots,
      runwayHeadingDeg,
      runwaySlopePercent,
      runwayConditionCode,
      reverserStatus,
      antiIce,
      flaps,
      deiceFluidApplied: inputs.deice === 'YES',
    });
  } catch (error) {
    console.error('C56X take-off field-length calculation failed:', error);
    setUnavailable('Could not calculate C56X field length. Check the entered values.');
    return;
  }

  if (!result) {
    setUnavailable(
      'Conditions are outside the published chart ranges; no extrapolation is used.',
      false
    );
    return;
  }

  setDistanceComparison(
    result.dryRequiredDistanceFt,
    result.rccAdjustedDryDistanceFt,
    runwayConditionCode
  );
  if (!Number.isFinite(result.selectedDistanceFt)) {
    const reason = `RWCC ${runwayConditionCode} field length is not available for this setup.`;
    if (toraStatusElement) toraStatusElement.textContent = 'Not available';
    if (todaStatusElement) todaStatusElement.textContent = 'Not available';
    if (asdaStatusElement) asdaStatusElement.textContent = 'Not available';
    ['c56x-badge-tora', 'c56x-badge-toda', 'c56x-badge-asda',
      'c56x-badge-mass-limit'].forEach(
      (id) => setC56xChecklistBadge(id, null)
    );
    card.classList.add('is-exceeded');
    card.classList.remove('is-within-limits');
    updateC56xTakeoffDistanceCard(null, [], true, reason);
    renderC56xTakeoffChart(null, toraM, todaM, asdaM);
    return;
  }

  const selectedDistanceM = result.selectedDistanceFt * 0.3048;
  if (v1Element) {
    v1Element.textContent = Number.isFinite(speeds?.v1)
      ? `${Math.round(speeds.v1)} kt`
      : 'Not available';
  }
  if (v1CorrectionElement) {
    v1CorrectionElement.textContent = getC56xV1CorrectionLabel(
      runwaySlopePercent,
      speeds?.v1CorrectionKnots
    );
  }
  setC56xChecklistBadge('c56x-badge-v1', Number.isFinite(speeds?.v1));

  const runwayLimitsM = [toraM, todaM, asdaM];
  if (runwayConditionCode !== '6') {
    let wetRunwayMassLimitLb = null;
    let wetMassLimitCalculationFailed = false;
    if (Number.isFinite(result.rccAdjustedDryDistanceFt) &&
        runwayLimitsM.every(Number.isFinite)) {
      try {
        wetRunwayMassLimitLb = getC56xWetRunwayMassLimit({
          qnhHpa,
          fieldElevationFt,
          oatC,
          windDirectionDeg,
          windSpeedKnots,
          runwayHeadingDeg,
          runwaySlopePercent,
          reverserStatus,
          antiIce,
          flaps,
          runwayLimitsM,
          runwayConditionCode,
          deiceFluidApplied: inputs.deice === 'YES',
        });
      } catch (error) {
        wetMassLimitCalculationFailed = true;
        console.error('C56X wet runway mass limit calculation failed:', error);
      }
    }
    setC56xChecklistBadge(
      'c56x-badge-mass-limit',
      Number.isFinite(wetRunwayMassLimitLb)
        ? weightLb <= wetRunwayMassLimitLb
        : result.rccAdjustedDryDistanceFt === null || wetMassLimitCalculationFailed
          ? null
          : runwayLimitsM.every(Number.isFinite) ? false : null
    );
  } else {
    setC56xChecklistBadge(
      'c56x-badge-mass-limit',
      runwayConditionCode === '6' ? true : null
    );
  }

  const runwayLimitChecks = [
    { element: toraStatusElement, badgeId: 'c56x-badge-tora', label: 'TORA', limit: toraM },
    { element: todaStatusElement, badgeId: 'c56x-badge-toda', label: 'TODA', limit: todaM },
    { element: asdaStatusElement, badgeId: 'c56x-badge-asda', label: 'ASDA', limit: asdaM },
  ];
  const failedLimits = [];
  let hasUnavailableLimit = false;
  runwayLimitChecks.forEach(({ element, badgeId, label, limit }) => {
    if (!Number.isFinite(limit) || limit < 0) {
      hasUnavailableLimit = true;
      if (element) element.textContent = 'Unavailable';
      setC56xChecklistBadge(badgeId, null);
      return;
    }
    const isWithinLimit = selectedDistanceM <= limit;
    if (!isWithinLimit) failedLimits.push(label);
    if (element) {
      element.textContent = `${Math.ceil(selectedDistanceM).toLocaleString('en-US')} m / ` +
        `${Math.round(limit).toLocaleString('en-US')} m`;
    }
    setC56xChecklistBadge(badgeId, isWithinLimit);
  });
  card.classList.toggle('is-exceeded', failedLimits.length > 0);
  card.classList.toggle('is-within-limits', failedLimits.length === 0 && !hasUnavailableLimit);
  updateC56xTakeoffDistanceCard(
    Math.ceil(selectedDistanceM),
    failedLimits,
    !hasUnavailableLimit,
    'Awaiting performance',
    result.factorBreakdown
  );
  renderC56xTakeoffChart(selectedDistanceM, toraM, todaM, asdaM);
}

// Finds the highest mass (50 lbs steps) that satisfies all take-off limits for the
// current setup, without changing the mass selected by the user.
export function updateMaxTakeoffMass() {
  const valueElement = document.getElementById('max-to-mass-val');
  const slider = document.getElementById('to-mass');
  if (!valueElement || !slider) return;

  const aircraftType = AIRCRAFT_TYPE_BY_REGISTRATION[
    document.getElementById('global-registration')?.value
  ];
  if (aircraftType === 'C56X') {
    const marginElement = document.getElementById('max-to-mass-margin');
    const card = document.getElementById('max-to-mass-card');
    const airport = getSelectedAirportRecord('to');
    const elevationValue = updateTakeoffAirportElevation(airport);

    const inputs = readPerformanceInputs(document).takeoff;
    const qnhHpa = Number(inputs.qnh);
    const oatC = Number(inputs.oat);
    const antiIce = inputs.antiIce || 'OFF';
    const flaps = Number(inputs.flaps);
    const runwayConditionCode = inputs.rwcc;
    const reverserStatus = inputs.reversers || 'AVAILABLE';
    const runwayHeadingDeg = airportCellValue(airport?.['RWYHDG [°](H6)']);
    const runwaySlopePercent = airportCellValue(airport?.['Slope [%](G6)']);
    const runwayLimitsM = [
      airportCellValue(airport?.['TORA [m] (C6)']),
      airportCellValue(airport?.['TODA [m](D6)']),
      airportCellValue(airport?.['ASDA [m](E6)']),
    ];
    const windSpeedKnots = Number(inputs.windSpeed);
    const windDirectionDeg = Number(inputs.windDir);
    const windInputsValid = Number.isFinite(windSpeedKnots) && windSpeedKnots >= 0 &&
      Boolean(inputs.windSpeed.trim()) &&
      (windSpeedKnots === 0 ||
        (Number.isFinite(windDirectionDeg) &&
         inputs.windDir.trim()));
    const selectedMass = Number(slider.value);
    const minMass = Number(slider.min);
    const maxSliderMass = Number(slider.max);
    const step = Number(slider.step) || 50;
    let maxMass = null;
    let takeoffDistanceAtMaxMassM = null;
    let pressureAltitudeFt = null;
    let climbLimitLb = null;
    const shortestRunwayLimitM = Math.min(...runwayLimitsM);
    let unavailableReason = 'Select an airport and runway to load aerodrome elevation.';

    if (typeof elevationValue === 'number') {
      if (!inputs.qnh.trim() || !inputs.oat.trim() ||
          !Number.isFinite(qnhHpa) || !Number.isFinite(oatC) || qnhHpa <= 0 ||
          !Number.isFinite(runwayHeadingDeg) || !Number.isFinite(runwaySlopePercent) ||
          !runwayLimitsM.every((limit) => Number.isFinite(limit) && limit >= 0) ||
          !windInputsValid || !Number.isFinite(minMass) ||
          !Number.isFinite(maxSliderMass) ||
          step <= 0 || !['1', '2', '3', '4', '5', '6'].includes(runwayConditionCode) ||
          ![7, 15].includes(flaps) || !['ON', 'OFF'].includes(antiIce) ||
          !['AVAILABLE', 'INOP'].includes(reverserStatus)) {
        unavailableReason = 'Enter valid weather, runway limits and C56X take-off configuration values.';
      } else {
        try {
          pressureAltitudeFt = calculateC56xPressureAltitude(qnhHpa, elevationValue);
          const climbResult = getC56xMaxTakeoffWeight({
            qnhHpa,
            fieldElevationFt: elevationValue,
            oatC,
            flaps,
            antiIce,
          });
          climbLimitLb = climbResult.maxTakeoffWeightLb;
          unavailableReason = climbLimitLb === null
            ? 'Conditions are outside the available C56X climb-limit data.'
            : '';
          const requiredGradient = airportCellValue(
            airport['min climb gradient OEI(I6)']
          );
          const climbPath = getC56xEngineOutClimbPath(airport);
          if (climbLimitLb !== null && Number.isFinite(requiredGradient)) {
            const lastIndex = Math.floor(
              (Math.min(maxSliderMass, climbLimitLb) - minMass) / step
            );
            const headwindKnots = windSpeedKnots === 0
              ? 0
              : windSpeedKnots * Math.cos(
                (((windDirectionDeg - runwayHeadingDeg + 540) % 360) - 180) *
                  Math.PI / 180
              );
            for (let index = lastIndex; index >= 0; index--) {
              const candidateMass = minMass + index * step;
              const fieldLengths = getC56xTakeoffFieldLengths({
                qnhHpa,
                fieldElevationFt: elevationValue,
                oatC,
                weightLb: candidateMass,
                windDirectionDeg,
                windSpeedKnots,
                runwayHeadingDeg,
                runwaySlopePercent,
                runwayConditionCode,
                reverserStatus,
                antiIce,
                flaps,
                deiceFluidApplied: inputs.deice === 'YES',
              });
              const selectedDistanceM = Number.isFinite(fieldLengths?.selectedDistanceFt)
                ? fieldLengths.selectedDistanceFt * 0.3048
                : null;
              if (selectedDistanceM === null || selectedDistanceM > shortestRunwayLimitM) {
                continue;
              }
              const speeds = getC56xTakeoffSpeeds({
                pressureAltitudeFt,
                weightLb: candidateMass,
                oatC,
                headwindKnots,
                runwayConditionCode,
                runwaySlopePercent,
                reverserStatus,
                antiIce,
                flaps,
              });
              const secondSegmentGradient = getC56xSecondSegmentClimbGradient({
                pressureAltitudeFt,
                weightLb: candidateMass,
                oatC,
                headwindKnots,
                flaps,
                antiIce,
                turningClimb: climbPath.turning,
              });
              if (Number.isFinite(speeds?.v1) &&
                  Number.isFinite(secondSegmentGradient) &&
                  secondSegmentGradient >= requiredGradient) {
                maxMass = candidateMass;
                takeoffDistanceAtMaxMassM = selectedDistanceM;
                break;
              }
            }
            if (maxMass === null && !unavailableReason) {
              unavailableReason = 'No mass in range meets all current take-off limits.';
            }
          } else if (climbLimitLb !== null) {
            unavailableReason = 'Required runway climb gradient is unavailable.';
          }
        } catch (error) {
          console.error('Max C56X take-off mass calculation failed:', error);
          unavailableReason = 'Could not calculate the C56X current-setup mass limit.';
        }
      }
    }

    valueElement.textContent = maxMass === null
      ? 'Not available'
      : `${maxMass.toLocaleString('en-US')} lbs`;
    if (marginElement) {
      marginElement.textContent = maxMass === null
        ? unavailableReason
        : `PA ${Math.round(pressureAltitudeFt).toLocaleString('en-US')} ft · ` +
          `Anti-ice ${antiIce} · ` +
          `TKOF at max ${Math.ceil(takeoffDistanceAtMaxMassM).toLocaleString('en-US')} m / ` +
          `${Math.round(shortestRunwayLimitM).toLocaleString('en-US')} m runway limit · ` +
          `Climb limit ${Math.round(climbLimitLb).toLocaleString('en-US')} lbs · ` +
          (selectedMass <= maxMass
            ? `Selected mass OK (${(maxMass - selectedMass).toLocaleString('en-US')} lbs margin)`
            : `Selected mass exceeds by ${(selectedMass - maxMass).toLocaleString('en-US')} lbs`);
    }
    if (card) {
      card.classList.toggle('is-exceeded', maxMass === null || selectedMass > maxMass);
      card.classList.toggle('is-within-limits', maxMass !== null && selectedMass <= maxMass);
    }
    return;
  }

  if (!AppState.hfInstance) return;

  const config = CELL_MAPPING.takeoff;
  const sheetId = AppState.hfInstance.getSheetId(config.sheetName);
  const pos = parseCellRef(config.inputs.mass);
  if (!pos) return;
  const address = { sheet: sheetId, col: pos.col, row: pos.row };
  const step = Number(slider.step) || 50;
  const min = Number(slider.min);
  const max = Number(slider.max);
  const selectedMass = Number(slider.value);

  let result = null;
  try {
    const setMass = (mass) => AppState.hfInstance.setCellContents(address, [[mass]]);
    const lastIndex = Math.floor((max - min) / step);
    const okAt = (index) => { setMass(min + index * step); return takeoffLimitsOk(); };
    for (let index = lastIndex; index >= 0; index--) {
      if (okAt(index)) { result = min + index * step; break; }
    }
  } catch (e) {
    console.error('Max take-off mass calculation failed:', e);
  } finally {
    AppState.hfInstance.setCellContents(address, [[selectedMass]]);
  }

  const card = document.getElementById('max-to-mass-card');
  const marginElement = document.getElementById('max-to-mass-margin');
  valueElement.textContent = result === null ? 'None' : `${result} lbs`;
  if (marginElement) {
    marginElement.textContent = result === null
      ? 'No mass in range meets all limits'
      : selectedMass <= result
        ? `Selected mass OK (${result - selectedMass} lbs margin)`
        : `Selected mass exceeds by ${selectedMass - result} lbs`;
  }
  if (card) {
    card.classList.toggle('is-exceeded', result === null || selectedMass > result);
    card.classList.toggle('is-within-limits', result !== null && selectedMass <= result);
  }
}
