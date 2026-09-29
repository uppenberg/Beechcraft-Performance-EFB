// Beräkna vindkomponenter
function calculateWind(windDir, windSpeed, rwyHeading) {
  if (isNaN(windDir) || isNaN(windSpeed) || isNaN(rwyHeading)) {
    return { hw: 0, xw: 0 };
  }
  const diff = (windDir - rwyHeading) * (Math.PI / 180);
  const hw = Math.round(windSpeed * Math.cos(diff));
  const xw = Math.abs(Math.round(windSpeed * Math.sin(diff)));
  return { hw, xw };
}

// Beräkna startprestanda och EASA-krav
function computeTakeoff(mass, rwcc, factors, rwyData, windData, flaps, contaminant) {
  const baseRoll = 539; 
  const rccFactor = factors.rwcc[rwcc]?.factor || 1.67;
  
  // Beräkningar baserade på vikt, vind och kontamination
  const windFactor = windData.hw < 0 ? 1.15 : (1 - (windData.hw * 0.01));
  const tor = Math.round(baseRoll * (mass / 12500) * windFactor);
  const tod = Math.round(tor * 1.5);
  const asd = Math.round(tod * (rwcc < 5 ? rccFactor : 1.2));
  
  const climbGrad = (mass > 12000 ? 5.0 : 5.6);
  const minClimbReq = rwyData.minClimbGradient || 3.3;

  return {
    tor,
    tod,
    asd,
    v1: 94,
    vr: 94,
    v2: 103,
    climbGrad,
    minClimbReq,
    climbOk: climbGrad >= minClimbReq,
    torOk: tor <= rwyData.tora,
    todOk: tod <= rwyData.toda,
    asdOk: asd <= rwyData.asda,
    passed: tor <= rwyData.tora && tod <= rwyData.toda && asd <= rwyData.asda
  };
}

// Beräkna landningsprestanda
function computeLanding(mass, rwcc, factors, rwyData, windData, flaps) {
  const baseLD = flaps === "UP" ? 2371 : 1384;
  const rccFactor = factors.rwcc[rwcc]?.factor || 1.67;
  const lda = rwyData.lda || 2000;
  
  const ld = Math.round(baseLD * (mass / 12500) * (rccFactor / 2.0));
  const missedClimb = 3.2; // Exempelvärde % OEI go-around

  return {
    ld,
    lda,
    vref: flaps === "UP" ? 119 : 103,
    missedClimb,
    passed: ld <= lda && missedClimb > 2.5
  };
}
