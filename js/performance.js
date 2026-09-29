// Beräkna med-/motvind och sidvind baserat på vindriktning, vindstyrka och banans färdriktning (heading)
function calculateWindComponents(windDir, windSpeed, rwyHeading) {
  if (isNaN(windDir) || isNaN(windSpeed) || isNaN(rwyHeading)) {
    return { headTailWind: 0, crossWind: 0 };
  }

  // Vinkelskillnad i radianer
  const angleDiff = (windDir - rwyHeading) * (Math.PI / 180);
  
  // Med-/motvind (+ = motvind, - = medvind)
  const headTailWind = Math.round(windSpeed * Math.cos(angleDiff));
  
  // Sidvind (absolut belopp)
  const crossWind = Math.abs(Math.round(windSpeed * Math.sin(angleDiff)));

  return { headTailWind, crossWind };
}

// Validera prestanda mot EASA-krav (exempel för start)
pwaPerformanceCheck = {
  validateTakeoff(tora, asda, tor, tod, asd) {
    return {
      torOk: tor <= tora || tora === 0,
      todaOk: tod <= tora || tora === 0,
      asdaOk: asd <= asda || asda === 0
    };
  },
  
  validateLanding(lda, ldgDist) {
    return {
      landingOk: ldgDist <= lda || lda === 0,
      marginMeters: lda - ldgDist
    };
  }
};
