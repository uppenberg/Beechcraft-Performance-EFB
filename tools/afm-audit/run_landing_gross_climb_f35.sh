#!/usr/bin/env bash
# Re-import the Flaps 35 landing gross climb gradient (Figures 4-49*/4-50*) from the AFM PDFs.
# Usage: run_landing_gross_climb_f35.sh PDF_DIR
set -eu
DIR=${1:?PDF directory}
ROOT=$(cd "$(dirname "$0")/../.." && pwd)
PY=${PYTHON:-python3}
TOOLS="$ROOT/tools/afm-audit"
WORK="$TOOLS/out"
WEIGHTS='20000,18700,18500,18000,17500;17000,16000,15000,14000,13000'
mkdir -p "$WORK"
for f in off on; do
  NAME="landing-gross-climb-gradient-flaps35-$f.js"
  CONST="landingGrossClimbGradient_flaps35_anti_ice_$f"
  "$PY" "$TOOLS/read_afm_grid.py" "$DIR/land_gross_climb_grad_f35_antiice_$f.pdf" "$WORK/f35-$f.json"
  CORR=()
  [ -f "$TOOLS/review/landing-gross-climb-f35-$f-temp-corrections.json" ] && CORR=(--corrections "$TOOLS/review/landing-gross-climb-f35-$f-temp-corrections.json")
  "$PY" "$TOOLS/build_grid_js.py" "$WORK/f35-$f.json" "$WORK/$NAME" --const "$CONST" --weights "$WEIGHTS" "${CORR[@]}"
  node --check "$WORK/$NAME"
  cp "$WORK/$NAME" "$ROOT/data/c56x/$NAME"
  node "$TOOLS/check-gradient-monotonic.js" "$WORK/$NAME" "$CONST" | tail -10
done
