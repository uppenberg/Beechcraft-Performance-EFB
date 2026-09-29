// Vindkomponenter (Head/Tail och Crosswind)
function calculateWind(windDir, windSpeed, rwyHeading) {
  if (isNaN(windDir) || isNaN(windSpeed) || isNaN(rwyHeading)) {
    return { hw: 0, xw: 0 };
  }
  const diff = (windDir - rwyHeading) * (Math.PI / 180);
  const hw = Math.round(windSpeed * Math.cos(diff));
  const xw = Math.abs(Math.round(windSpeed * Math.sin(diff)));
  return { hw, xw };
}

// Beräkna startprestanda
function computeTakeoff(mass, rwcc, factors, rwyData, windData) {
  const baseRoll = 539; // Baserat på AFM-referens för 12000-12500 lbs
  const rccFactor = factors.rwcc[rwcc]?.factor || 1.67;
  
  // Enkel modellering för lokal offline-beräkning
  const tor = Math.round(baseRoll * (mass / 12500) * (windData.hw < 0 ? 1.1 : 0.95));
  const tod = Math.round(tor * 1.5);
  const asd = Math.round(tod * rccFactor * 0.9);

  return {
    tor,
    tod,
    asd,
    v1: 94,
    vr: 94,
    v2: 103,
    passed: tor <= rwyData.tora && asd <= rwyData.asda
  };
}

// Beräkna landningsprestanda
function computeLanding(mass, rwcc, factors, lda, windData) {
  const baseLD = 1200; // Basreferens landningssträcka
  const rccFactor = factors.rwcc[rwcc]?.factor || 1.67;
  
  const ld = Math.round(baseLD * (mass / 12500) * rccFactor);
  
  return {
    landingDistance: ld,
    lda: lda,
    vref: 119,
    passed: ld <= lda
  };
}
