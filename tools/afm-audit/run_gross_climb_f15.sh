#!/usr/bin/env bash
# Re-import Flaps 15 approach gross climb gradient (ON/OFF) from the AFM PDFs.
# Usage: run_gross_climb_f15.sh PDF_DIR [MAX_ALTITUDE]
set -u
DIR=${1:?PDF directory}
MAXALT=${2:-6000}
ROOT=$(cd "$(dirname "$0")/../.." && pwd)
PY="$ROOT/.venv/bin/python"
WORK="$ROOT/tools/afm-audit/out"   # .json/.todo sidecars stay here (gitignored), only .js goes to data/
mkdir -p "$WORK"
for f in on off; do
  NAME="gross-climb-gradient-flaps15-$f.js"
  OUT="$WORK/$NAME"
  CONST="approachGrossClimbGradient_flaps15_anti_ice_$f"
  "$PY" "$ROOT/tools/afm-audit/read_gradient.py" "$DIR/app_gross_climb_grad_f15_antiice_$f.pdf" "$OUT" \
    --profile "$ROOT/tools/afm-audit/profiles/gross-climb-gradient-f15-$f.json" \
    --const "$CONST" --max-altitude "$MAXALT" \
    --corrections "$ROOT/tools/afm-audit/review/gross-climb-f15-$f-gap-corrections.json"
  [ $? -le 2 ] || exit 1
  node --check "$OUT" || exit 1
  cp "$OUT" "$ROOT/data/c56x/$NAME"
  node "$ROOT/tools/afm-audit/check-gradient-monotonic.js" "$OUT" "$CONST" | tail -3
done
