import { finiteNumber, exceedsDistanceLimit, windLimitStatus } from './performance-limits.js';
export { exceedsDistanceLimit } from './performance-limits.js';
import { getAirportRows, suggestRunwayFromMetar, updateRunwaySuggestion } from './airport-ui.js';
import { AppState, CELL_MAPPING, isC56xSelected } from './app-state.js';
import { MetarWeather } from './metar-weather.js';
import { persistFormState, saveMetar } from './workbook-data.js';
import { getTakeoffOutput, parseCellRef } from './workbook-adapter.js';
import { refreshOutputs, updateEngineCellValues } from './workbook-engine.js';


// Performance cards, charts, and METAR interaction

function metarAgeColor(ageMinutes) {
  return ageMinutes >= 60 ? '#f85149'
    : ageMinutes >= 35 ? '#d29922'
      : '#3fb950';
}

function updateMetarColors() {
  const now = Date.now();
  document.querySelectorAll('[id$="-metar-display"][data-metar-observed-at]').forEach(display => {
    const observedAt = Number(display.dataset.metarObservedAt);
    if (!Number.isFinite(observedAt)) return;
    const color = metarAgeColor((now - observedAt) / 60000);
    if (display.style.color !== color) display.style.color = color;
  });
}

function scheduleMetarColorUpdate() {
  const now = new Date();
  const nextCheck = new Date(now);
  nextCheck.setSeconds(0, 0);
  nextCheck.setMinutes(now.getMinutes() < 30 ? 30 : 60);
  window.setTimeout(() => {
    updateMetarColors();
    scheduleMetarColorUpdate();
  }, Math.max(0, nextCheck.getTime() - now.getTime()));
}

scheduleMetarColorUpdate();
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) updateMetarColors();
});

export function updateBadgeStatus(elementId, val1, val2) {
  const badge = document.getElementById(elementId);
  if (!badge) return;
  const exceeded = exceedsDistanceLimit(val1, val2);
  if (exceeded === null) {
    badge.innerText = "FAIL";
    badge.style.background = "rgba(248, 81, 73, 0.15)";
    badge.style.color = "#f85149";
    return;
  }

  if (!exceeded) {
    badge.innerText = "OK";
    badge.style.background = "rgba(46, 160, 67, 0.15)";
    badge.style.color = "#3fb950";
  } else {
    badge.innerText = "FAIL";
    badge.style.background = "rgba(248, 81, 73, 0.15)";
    badge.style.color = "#f85149";
  }
}

export function safeSetText(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) el.innerText = text;
}

export function safeSetValue(elementId, value) {
  const el = document.getElementById(elementId);
  if (el) el.value = (value !== '-' && value !== null && value !== undefined) ? value : '';
}

// Uppdaterad METAR-hämtning med färglogik (<35 min grön, 35-60 min amber, >60 min eller icao-fel röd)
export async function fetchMetarText(targetUrl, sourceName) {

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 sekunder

  try {
    const response = await fetch(targetUrl, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`${sourceName} returned HTTP ${response.status}`);
    }
    return (await response.text()).trim();
  } finally {
    clearTimeout(timeoutId);
  }
}

export function validateMetar(metarText, expectedIcao) {
  const report = metarText.split(/\r?\n/).map(line => line.trim()).find(Boolean) || '';
  const stationMatch = report.match(/^(?:(?:METAR|SPECI)\s+)?([A-Z]{4})\b/i);
  if (!stationMatch || stationMatch[1].toUpperCase() !== expectedIcao) {
    throw new Error(`METAR station does not match ${expectedIcao}`);
  }

  const timeMatch = report.match(/\b(\d{2})(\d{2})(\d{2})Z\b/);
  if (!timeMatch) {
    throw new Error('METAR report has no valid observation time');
  }

  const [, dayText, hourText, minuteText] = timeMatch;
  const reportDay = Number(dayText);
  const reportHour = Number(hourText);
  const reportMinute = Number(minuteText);
  if (reportDay < 1 || reportDay > 31 || reportHour > 23 || reportMinute > 59) {
    throw new Error('METAR report has an invalid observation time');
  }

  const now = new Date();
  const reportDates = [-1, 0, 1]
    .map(monthOffset => new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth() + monthOffset,
      reportDay,
      reportHour,
      reportMinute
    )))
    .filter(date => date.getUTCDate() === reportDay && date <= now);

  if (reportDates.length === 0) {
    throw new Error('METAR observation time is in the future or invalid');
  }

  const reportDate = reportDates.reduce((latest, date) => date > latest ? date : latest);
  const ageMinutes = (now - reportDate) / 60000;
  if (ageMinutes > 60) {
    throw new Error(`METAR is too old (${Math.floor(ageMinutes)} minutes)`);
  }

  return {
    text: report.replace(/^(?:METAR|SPECI)\s+/i, ''),
    ageMinutes
  };
}

export function setMetarWeatherStatus(prefix, message) {
  const status = document.getElementById(`${prefix}-metar-weather-status`);
  if (!status) return;
  status.textContent = message;
  status.hidden = !message;
}

export function clearAirportMetar(prefix) {
  const displaySpan = document.getElementById(`${prefix}-metar-display`);
  if (displaySpan) {
    displaySpan.textContent = '-';
    displaySpan.style.color = '#8b949e';
  }
  setMetarWeatherStatus(prefix, '');
}

export async function fetchMetarForAirport(prefix, populateWeather = true) {
  const icaoCode = AppState.airportSelection[prefix].icao;
  const displaySpan = document.getElementById(`${prefix}-metar-display`);
  setMetarWeatherStatus(prefix, '');
  updateRunwaySuggestion(prefix, 'Checking METAR wind for a runway suggestion...');
  try {
    if (!/^[A-Z0-9]{4}$/.test(icaoCode) || !getAirportRows(icaoCode).length) {
      clearAirportMetar(prefix);
      updateRunwaySuggestion(prefix, '');
      return;
    }

    if (displaySpan && (!displaySpan.textContent || displaySpan.textContent === '-')) {
      displaySpan.textContent = "Downloading METAR...";
      displaySpan.style.color = "#8b949e";
    }

    const noaaUrl = `/api/reports/metar?ids=${encodeURIComponent(icaoCode)}&format=raw`;
    const appsScriptUrl = `https://script.google.com/macros/s/AKfycbzfUIgEmCV4kCVnD1hK6rD8aWnurtyNvQQt6towRzG6QWA07-0iRZ5aZ5ctJIhBY_98YA/exec?icao=${encodeURIComponent(icaoCode)}`;
    const workerUrl = `https://metar-proxy.uppenberg1.workers.dev/?icao=${encodeURIComponent(icaoCode)}`;

    const metarSources = [
      { url: workerUrl, name: 'Cloudflare Worker' },
      { url: noaaUrl, name: 'Netlify Proxy' },
      { url: appsScriptUrl, name: 'Google Apps Script' },

    ];
    let validatedMetar;
    let sourceName;
    let lastError;

    for (const source of metarSources) {
      try {
        validatedMetar = validateMetar(await fetchMetarText(source.url, source.name), icaoCode);
        sourceName = source.name;
        break;
      } catch (sourceError) {
        lastError = sourceError;
        console.warn(`${source.name} failed:`, sourceError);
      }
    }
    if (!validatedMetar) throw lastError;

    if (AppState.airportSelection[prefix].icao !== icaoCode) return;
    console.info(`METAR hämtad från ${sourceName}.`);

    if (displaySpan) {
      displaySpan.textContent = validatedMetar.text;
      displaySpan.dataset.metarObservedAt = String(Date.now() - validatedMetar.ageMinutes * 60000);
      displaySpan.style.color = metarAgeColor(validatedMetar.ageMinutes);
    }
    saveMetar(prefix, icaoCode, validatedMetar);
    suggestRunwayFromMetar(validatedMetar.text, prefix);
    if (populateWeather) {
      populateWeatherFromMetar(validatedMetar.text, prefix);
      persistFormState();
    }
  } catch (error) {
    console.error("Fel vid hämtning av METAR:", error);
    if (AppState.airportSelection[prefix].icao !== icaoCode) return;
    updateRunwaySuggestion(prefix, 'No runway suggestion: METAR could not be retrieved.');
    if (displaySpan && (!displaySpan.textContent || displaySpan.textContent === '-' ||
        displaySpan.textContent === 'Downloading METAR...')) {
      displaySpan.textContent = "METAR unavailable or invalid from all sources";
      displaySpan.style.color = "#f85149";
    } else if (displaySpan) {
      displaySpan.style.color = '#f85149';
    }
  }
}

export function fetchMetarForSelectedAirport(prefix) {
  fetchMetarForAirport(prefix);
}

export function parseAndPopulateMetarData(metarText) {
  return populateWeatherFromMetar(metarText, 'to');
}

export function populateWeatherFromMetar(metarText, prefix) {
  if (!metarText || metarText.includes('INGEN METAR') || metarText.includes('OFFLINE')) return false;

  const parsed = MetarWeather.parse(metarText);
  if (parsed.windUnit === 'MPS') {
    setMetarWeatherStatus(
      prefix,
      'METAR wind is in m/s; weather fields were left unchanged. Enter wind manually in kt.'
    );
    return false;
  }

  const controlIds = {
    windDir: `${prefix}-wind-dir`,
    windSpeed: `${prefix}-wind-spd`,
    oat: `${prefix}-oat`,
    qnh: `${prefix}-qnh`,
  };
  Object.values(controlIds).forEach((id) => {
    const element = document.getElementById(id);
    if (!element) return;
    element.style.color = '#fff';
    element.style.borderColor = '#30363d';
    element.style.background = '#0d1117';
  });

  const sheetType = prefix === 'to' ? 'takeoff' : 'landing';
  if (AppState.hfInstance) {
    try {
      updateEngineCellValues(sheetType, parsed.values);
    } catch (error) {
      console.error('Could not apply METAR weather values:', error);
      setMetarWeatherStatus(
        prefix,
        'Could not apply METAR values; weather fields were left unchanged. Enter values manually.'
      );
      return false;
    }
  }

  Object.entries(parsed.values).forEach(([field, value]) => {
    const control = document.getElementById(controlIds[field]);
    if (control) control.value = value;
  });
  setMetarWeatherStatus(prefix, '');
  if (typeof refreshOutputs === 'function') refreshOutputs();
  return true;
}

window.addEventListener('DOMContentLoaded', () => {
  const savedReg = localStorage.getItem('selected_reg');
  if (savedReg) {
    const regSelect = document.getElementById('global-registration');
    if (regSelect) regSelect.value = savedReg;
  }
});

export function checkContaminationLogic() {
  if (!AppState.hfInstance) return true;

  const config = CELL_MAPPING.takeoff;
  const sheetId = AppState.hfInstance.getSheetId(config.sheetName);

  const rccPos = parseCellRef("C10");
  const currentRccVal = AppState.hfInstance.getCellValue({ sheet: sheetId, col: rccPos.col, row: rccPos.row });

  if (currentRccVal === 6 || currentRccVal === '6' || currentRccVal === '-' || currentRccVal === 'Dry' || currentRccVal === '') {
    return true;
  }

  const currentTor = finiteNumber(getTakeoffOutput('tor', false));
  let dryTor;
  try {
    AppState.hfInstance.setCellContents({ sheet: sheetId, col: rccPos.col, row: rccPos.row }, 6);
    dryTor = finiteNumber(getTakeoffOutput('tor', false));
  } finally {
    AppState.hfInstance.setCellContents({ sheet: sheetId, col: rccPos.col, row: rccPos.row }, currentRccVal);
  }
  return currentTor !== null && dryTor !== null && dryTor > 0 && currentTor >= dryTor;
}

export const finiteDistance = finiteNumber;

export function updateRunwayExceedanceCard(cardId, statusId, checks) {
    const card = document.getElementById(cardId);
    const status = document.getElementById(statusId);
    if (!card || !status) return;

    const exceeded = checks.filter((check) =>
        exceedsDistanceLimit(check.distance, check.limit) === true
    );
    const hasMissingValues = checks.some((check) =>
        exceedsDistanceLimit(check.distance, check.limit) === null
    );

    card.classList.toggle('is-exceeded', exceeded.length > 0);
    card.classList.toggle('is-within-limits', exceeded.length === 0 && !hasMissingValues);
    status.textContent = exceeded.length
        ? exceeded.map((check) => `${check.label} Exceeded`).join(' · ')
        : hasMissingValues
            ? 'Awaiting performance'
            : 'Within limits';
}

// Largest distance/runway ratio that still fits inside the free space after the runway end
export function getRunwayMaxRatio(runwayStrip) {
    const container = runwayStrip?.parentElement;
    if (!runwayStrip || !container || runwayStrip.clientWidth <= 0) return 1;
    const margin = parseFloat(getComputedStyle(container).getPropertyValue('--runway-end-margin')) || 0;
    return 1 + Math.max(margin - 4, 0) / runwayStrip.clientWidth;
}

export function renderC56xTakeoffChart(takeoffDistanceM, toraM, todaM, asdaM) {
    const runwayStrip = document.querySelector('#page-takeoff .runway-strip');
    const usedRunway = document.getElementById('takeoff-used-runway');
    const tkofMarker = document.getElementById('tor-marker');
    const otherMarkers = ['tod-marker', 'asd-marker']
        .map((id) => document.getElementById(id))
        .filter(Boolean);
    if (tkofMarker) {
        tkofMarker.dataset.label = 'TKOF';
        tkofMarker.hidden = !Number.isFinite(takeoffDistanceM);
    }
    otherMarkers.forEach((marker) => {
        marker.hidden = true;
    });

    const limits = [toraM, todaM, asdaM].filter((value) =>
        Number.isFinite(value) && value > 0
    );
    const referenceDistanceM = Number.isFinite(toraM) && toraM > 0
        ? toraM
        : limits.length ? Math.max(...limits) : 0;
    const hasTakeoffDistance = Number.isFinite(takeoffDistanceM) && takeoffDistanceM >= 0;
    const exceeded = hasTakeoffDistance && limits.some((limit) => takeoffDistanceM > limit);
    if (usedRunway) {
        usedRunway.classList.toggle('is-exceeded', exceeded);
        usedRunway.style.width = '0%';
    }
    if (!runwayStrip || referenceDistanceM <= 0 || !hasTakeoffDistance) return;

    const ratio = Math.min(
        Math.max(takeoffDistanceM / referenceDistanceM, 0),
        getRunwayMaxRatio(runwayStrip)
    );
    if (tkofMarker) {
        tkofMarker.style.left =
            `${runwayStrip.offsetLeft + ratio * runwayStrip.clientWidth}px`;
        tkofMarker.dataset.val = String(Math.ceil(takeoffDistanceM));
    }
    if (usedRunway) usedRunway.style.width = `${ratio * 100}%`;
}

export function renderTakeoffChart(tor, tod, asd, tora, toda, asda) {
    const exceeded = [
        exceedsDistanceLimit(tor, tora),
        exceedsDistanceLimit(tod, toda),
        exceedsDistanceLimit(asd, asda),
    ].some((result) => result === true);
    const usedRunway = document.getElementById('takeoff-used-runway');
    if (usedRunway) usedRunway.classList.toggle('is-exceeded', exceeded);

    const toraNum = parseFloat(tora) || 0;
    const availableDistances = [tora, toda, asda]
        .map((value) => parseFloat(value) || 0)
        .filter((value) => value > 0);
    const referenceDistance = Math.max(...availableDistances);
    if (toraNum <= 0 || referenceDistance <= 0) return;

    const runwayStrip = document.querySelector('#page-takeoff .runway-strip');
    const getRatio = (val) => {
        const num = parseFloat(val) || 0;
        return Math.min(Math.max(num / referenceDistance, 0), 1);
    };
    const maxDistance = Math.max(
        parseFloat(tor) || 0,
        parseFloat(tod) || 0,
        parseFloat(asd) || 0
    );
    const usedRatio = getRatio(maxDistance);

    [
        ['tor', tor],
        ['tod', tod],
        ['asd', asd]
    ].forEach(([id, value]) => {
        const marker = document.getElementById(`${id}-marker`);
        if (marker) {
            const markerRatio = getRatio(value);
            marker.style.left = `${runwayStrip ? runwayStrip.offsetLeft + markerRatio * runwayStrip.clientWidth : 0}px`;
            marker.setAttribute('data-val', Math.round(parseFloat(value) || 0));
        }
    });

    if (runwayStrip && usedRunway) {
        usedRunway.style.width = `${usedRatio * 100}%`;
    }

    const toraLabel = document.getElementById('tora-label');
    if (toraLabel) {
        toraLabel.textContent = `TORA: ${Math.round(toraNum)} m`;
    }
}

export function renderLandingChart(ldgDistUp, ldgDistDown, lda) {
    // Hämta vald flaps-setting (UP eller DOWN)
    const flapsSelect = document.getElementById('ldg-flaps');
    const currentFlaps = flapsSelect ? flapsSelect.value : 'DOWN';

    const markerUp = document.getElementById('ldg-dist-marker');
    const markerDown = document.getElementById('ldg-dist-down-marker');
    const runwayStrip = document.querySelector('#page-landing .runway-strip');
    const usedRunway = document.getElementById('landing-used-runway');
    const activeDistance = currentFlaps === 'UP' ? ldgDistUp : ldgDistDown;
    const ldaNum = parseFloat(lda) || 0;
    if (usedRunway) {
        usedRunway.classList.toggle(
            'is-exceeded',
            exceedsDistanceLimit(activeDistance, lda) === true
        );
    }
    if (ldaNum <= 0) return;

    const activeMarker = currentFlaps === 'UP' ? markerUp : markerDown;
    const distanceRatio = Math.min(
        Math.max((parseFloat(activeDistance) || 0) / ldaNum, 0),
        getRunwayMaxRatio(runwayStrip)
    );

    if (activeMarker) {
        const markerLeft = runwayStrip
            ? runwayStrip.offsetLeft + distanceRatio * runwayStrip.clientWidth
            : 0;
        activeMarker.style.left = `${markerLeft}px`;
        const distance = parseFloat(activeDistance) || 0;
        activeMarker.setAttribute('data-val', isC56xSelected() ? Math.ceil(distance) : Math.round(distance));
    }

    if (runwayStrip && usedRunway) {
        usedRunway.style.width = `${distanceRatio * 100}%`;
    }

    // Visa eller dölj markörer beroende på vald flaps-inställning
    if (currentFlaps === 'UP') {
        if (markerUp) {
            markerUp.style.display = 'block';
        }
        if (markerDown) {
            markerDown.style.display = 'none';
        }
    } else {
        if (markerDown) {
            markerDown.style.display = 'block';
        }
        if (markerUp) {
            markerUp.style.display = 'none';
        }
    }

    const ldaLabel = document.getElementById('lda-label');
    if (ldaLabel) {
        ldaLabel.textContent = `LDA: ${Math.round(ldaNum)} m`;
    }
}

export function updateClimbCheckCard(actualValue, reqValue) {
    const actualNum = parseFloat(actualValue);
    const reqNum = parseFloat(reqValue);

    const actualSpan = document.getElementById('res-to-oei');
    const reqSpan = document.getElementById('res-to-req');
    const cardContainer = document.getElementById('card-climb-check');
    if (!actualSpan || !reqSpan || !cardContainer) return;
    actualSpan.textContent = Number.isFinite(actualNum) ? actualNum.toFixed(1) + "%" : "-";
    reqSpan.textContent = Number.isFinite(reqNum) ? reqNum.toFixed(1) + "%" : "-";
    if (!Number.isFinite(actualNum) || !Number.isFinite(reqNum)) {
        cardContainer.style.background = "#0d1117";
        cardContainer.style.borderColor = "#30363d";
        return;
    }

    if (reqNum > actualNum) {
        cardContainer.style.background = "#3d1414";
        cardContainer.style.borderColor = "#f85149";
    } else {
        cardContainer.style.background = "#0d1117";
        cardContainer.style.borderColor = "#30363d";
    }
}

// Use raw numbers for the decision and round only the displayed components.
function renderWindCheckCard(prefix, headwind, crosswind, crosswindLimit) {
    const suffix = prefix === 'ldg' ? '-ldg' : '';
    const card = document.getElementById(`card-wind-check${suffix}`);
    if (!card) return;
    const display = (value) => {
        const number = finiteNumber(value);
        if (number !== null) return String(Math.round(number));
        if (typeof value === 'string' && /TW/i.test(value)) {
            return value.replace(/([\d.]+)(?=\s*TW)/i, (_, amount) => String(Math.round(Number(amount))));
        }
        return '-';
    };
    for (const [id, value] of [['hwtw', headwind], ['xw', crosswind], ['xwlimit', crosswindLimit]]) {
        const element = document.getElementById(`res-${prefix}-${id}`);
        if (element) {
            element.textContent = display(value);
            element.style.color = '#fff';
        }
    }
    const state = windLimitStatus(headwind, crosswind, crosswindLimit);
    card.style.background = state === 'red' ? '#3d1414' : state === 'amber' ? '#3b2e0c' : '#0d1117';
    card.style.borderColor = state === 'red' ? '#f85149' : state === 'amber' ? '#d29922' : '#30363d';
}

export function updateWindCheckCard(headwind, crosswind, crosswindLimit) {
    renderWindCheckCard('to', headwind, crosswind, crosswindLimit);
}

export function onManualInputChange(inputElement) {
    if (inputElement.value.trim() !== "") {
        inputElement.style.color = "#d29922";
        inputElement.style.borderColor = "#d29922";
        inputElement.style.background = "#221a05";
    } else {
        inputElement.style.color = "#fff";
        inputElement.style.borderColor = "#30363d";
        inputElement.style.background = "#0d1117";
    }
}

export function updateWindCheckCardLdg(headwind, crosswind, crosswindLimit) {
    renderWindCheckCard('ldg', headwind, crosswind, crosswindLimit);
}

//--------------AUTOPOPULATEMETAR_LAND BELOW-----------------
export function parseAndPopulateLandingMetarData(metarText) {
  return populateWeatherFromMetar(metarText, 'ldg');
}
