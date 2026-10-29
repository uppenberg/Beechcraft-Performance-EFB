const fs=require('fs');const s=fs.readFileSync('data/c56x/climb-gradient-flaps7.js','utf8');
const o=new Function(s+';return secondSegmentClimbGradient_flaps7_anti_ice_off')();
const [a,w]=process.argv.slice(2).map(Number);
o.find(x=>x.altitudeFt==a).weights.find(x=>x.weight==w).data.forEach(r=>console.log(r.temp,["-10","0","10","20","30"].map(k=>r.windKnots[k]).join(' ')));
