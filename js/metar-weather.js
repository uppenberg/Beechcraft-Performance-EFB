(() => {
  'use strict';

  const WIND_REGEX = /\b(?<direction>VRB|\d{3})(?<speed>\d{2,3})(?:G(?<gust>\d{2,3}))?(?<unit>KT|MPS)\b/i;
  const METERS_PER_SECOND_TO_KNOTS = 1.94384;
  const TEMPERATURE_REGEX = /\s(M?\d{2})\/(M?\d{2})\s/;
  const QNH_REGEX = /\bQ(\d{4})\b/i;
  const ALTIMETER_REGEX = /\bA(\d{4})\b/i;

  function parseWeather(metarText) {
    if (typeof metarText !== 'string') {
      return { windUnit: null, wind: null, values: {} };
    }

    const values = {};
    const windMatch = metarText.match(WIND_REGEX);
    const windUnit = windMatch?.groups.unit.toUpperCase() || null;
    const wind = windMatch ? parseWind(windMatch.groups) : null;

    // The app's calculator inputs use knots. Keep every field untouched for MPS reports.
    if (windUnit === 'MPS') return { windUnit, wind, values };

    if (wind) {
      values.windDir = wind.directionDegrees ?? 0;
      values.windSpeed = wind.speed;
    }

    const temperatureMatch = metarText.match(TEMPERATURE_REGEX);
    if (temperatureMatch) {
      values.oat = parseTemperature(temperatureMatch[1]);
    }

    const qnhMatch = metarText.match(QNH_REGEX);
    if (qnhMatch) {
      values.qnh = Number(qnhMatch[1]);
    } else {
      const altimeterMatch = metarText.match(ALTIMETER_REGEX);
      if (altimeterMatch) {
        values.qnh = Math.round(Number(altimeterMatch[1]) * 0.338639);
      }
    }

    return { windUnit, wind, values };
  }

  function parseWind(groups) {
    const unit = groups.unit.toUpperCase();
    const speed = Number(groups.speed);
    const direction = groups.direction.toUpperCase();
    const speedKnots = unit === 'MPS'
      ? speed * METERS_PER_SECOND_TO_KNOTS
      : speed;

    return {
      directionDegrees: direction === 'VRB' ? null : Number(direction),
      speed,
      gust: groups.gust ? Number(groups.gust) : null,
      unit,
      speedKnots,
    };
  }

  function parseTemperature(value) {
    return value.startsWith('M') ? -Number(value.slice(1)) : Number(value);
  }

  window.MetarWeather = Object.freeze({ parse: parseWeather });
})();
