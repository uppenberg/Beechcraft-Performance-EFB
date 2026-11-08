// Prints the takeoff gradient tables (dry + wet data files) as JSON for read_gradient_tables.py.
const fs = require('fs'), vm = require('vm'), path = require('path');
const dir = path.join(__dirname, '..', '..', 'data', 'c56x');
const ctx = {}; vm.createContext(ctx);
const src = ['takeoff-gradient-dry.js', 'takeoff-gradient-wet.js'].map(f => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n');
vm.runInContext(src + `
this.out = {
  f7on: takeoffFieldLengthGradient_Dry_Flaps7_AntiIceOn,
  f15off: takeoffFieldLengthGradient_Dry_Flaps15_AntiIceOff,
  f15on: takeoffFieldLengthGradient_Dry_Flaps15_AntiIceOn,
  f15wetoff: takeoffFieldLengthGradient_Wet_Flaps15_AntiIceOff,
  f15weton: takeoffFieldLengthGradient_Wet_Flaps15_AntiIceOn,
  f15wetrevoff: takeoffFieldLengthGradient_Wet_WithReversers_Flaps15_AntiIceOff,
  f15wetrevon: takeoffFieldLengthGradient_WetWithReversers_Flaps15_AntiIceOn,
  f7wetrev_on: takeoffGradientAdjustment_reversers_wet_Flaps7_AntiIceOn.data.map((r) => ({
    baseFieldLength: r.zeroGradient,
    uphill: { '2.0%': r.uphill2pct, '1.5%': r.uphill1_5pct, '1.0%': r.uphill1pct, '0.5%': r.uphill0_5pct },
    downhillShaded: { '-1%': r.downhillShaded_1pct, '-2%': r.downhillShaded_2pct },
    downhillNonShaded: { '-1%': r.downhillNonShaded_1pct, '-2%': r.downhillNonShaded_2pct },
  })),
  f7wetrevoff: takeoffGradientAdjustment_wet_reversers_Flaps7_AntiIceOff.data.map((r) => ({
    baseFieldLength: r.zeroGradient,
    uphill: { '2.0%': r.uphill2pct, '1.5%': r.uphill1_5pct, '1.0%': r.uphill1pct, '0.5%': r.uphill0_5pct },
    downhillShaded: { '-1%': r.downhillShaded_1pct, '-2%': r.downhillShaded_2pct },
    downhillNonShaded: { '-1%': r.downhillNonShaded_1pct, '-2%': r.downhillNonShaded_2pct },
  })),
};`, ctx);
console.log(JSON.stringify(ctx.out));

