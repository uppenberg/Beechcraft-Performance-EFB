#!/usr/bin/env python3
"""Converts read_afm_grid.py output into a data/c56x climb-gradient .js constant.

Sheet pairing (verified for Figures 4-47*..4-50*): sheets 2p and 2p+1 cover the same altitude blocks;
the even sheet carries the heavy weight set, the odd sheet the light set. Altitudes are numbered from
--start-alt in --alt-step steps, block by block, pair by pair. Checks performed before writing:
  - every cell has a value (no null / suspect cells unless --allow-suspect)
  - the temperature column of the heavy and light sheet agrees for every block
  - temperatures strictly increase inside a block
  - wind columns / weights are read in the printed order (5 weights x 5 winds)
Temperature corrections (from a visual check) go in a JSON file {"<sheet>/<block>/<row>": temp}.

Usage: build_grid_js.py GRID.json OUT.js --const NAME --weights "20000,18700,...;17000,16000,..."
         [--winds -10,0,10,20,30] [--corrections FILE.json] [--start-alt 0] [--alt-step 1000]
"""
import argparse
import json
import sys


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('grid')
    ap.add_argument('out')
    ap.add_argument('--const', required=True)
    ap.add_argument('--weights', required=True, help='"heavy,...;light,..." weight sets, ";" separates the two sheet types')
    ap.add_argument('--winds', default='-10,0,10,20,30')
    ap.add_argument('--corrections')
    ap.add_argument('--start-alt', type=int, default=0)
    ap.add_argument('--alt-step', type=int, default=1000)
    ap.add_argument('--allow-suspect', action='store_true')
    A = ap.parse_args()

    grid = json.load(open(A.grid))
    wsets = [[int(x) for x in s.split(',')] for s in A.weights.split(';')]
    winds = [int(x) for x in A.winds.split(',')]
    fixes = json.load(open(A.corrections)) if A.corrections else {}
    nsheets = len(grid)
    if nsheets % len(wsets):
        sys.exit(f'{nsheets} sheets is not a multiple of {len(wsets)} weight sets')
    errors = []
    altitudes = []
    alt = A.start_alt
    for p in range(nsheets // len(wsets)):
        sheets = [grid[str(p * len(wsets) + k)] for k in range(len(wsets))]
        nblocks = {len(s['blocks']) for s in sheets}
        if len(nblocks) != 1:
            errors.append(f'pair {p}: sheets have different block counts {nblocks}')
            continue
        for b in range(nblocks.pop()):
            temps = None
            weights = []
            for k, s in enumerate(sheets):
                rows = s['blocks'][b]['rows']
                sheet_no = p * len(wsets) + k
                t = [fixes.get(f'{sheet_no}/{b}/{r}', row['temp']) for r, row in enumerate(rows)]
                if temps is None:
                    temps = t
                elif temps != t:
                    errors.append(f'alt {alt}: temperature column differs between sheets {temps} vs {t}')
                if any(x is None for x in t) or any(a >= c for a, c in zip(t, t[1:])):
                    errors.append(f'alt {alt} sheet {sheet_no}: bad temperatures {t}')
                for wi, w in enumerate(wsets[k]):
                    data = []
                    for r, row in enumerate(rows):
                        vals = row['vals'][wi * len(winds):(wi + 1) * len(winds)]
                        if (None in vals or row['suspect']) and not A.allow_suspect:
                            errors.append(f'alt {alt} weight {w} temp {t[r]}: unreadable/suspect cells {row["suspect"]}')
                        data.append({'temp': t[r], 'wind': dict(zip(winds, vals))})
                    weights.append({'weight': w, 'data': data})
            altitudes.append({'altitudeFt': alt, 'weights': weights})
            alt += A.alt_step
    if errors:
        print('\n'.join(errors[:40]))
        sys.exit(f'{len(errors)} problems, nothing written')
    lines = [f'const {A.const} = [']
    for ai, a in enumerate(altitudes):
        lines += ['  {', f'    altitudeFt: {a["altitudeFt"]},', '    weights: [']
        for wi, w in enumerate(a['weights']):
            lines += ['      {', f'        weight: {w["weight"]},', '        data: [']
            for ri, row in enumerate(w['data']):
                ws = ', '.join(f'"{k}": {v}' for k, v in row['wind'].items())
                lines.append(f'          {{ temp: {row["temp"]}, windKnots: {{ {ws} }} }}' + (',' if ri < len(w['data']) - 1 else ''))
            lines += ['        ]', '      }' + (',' if wi < len(a['weights']) - 1 else '')]
        lines += ['    ]', '  }' + (',' if ai < len(altitudes) - 1 else '')]
    lines.append('];')
    open(A.out, 'w', newline='\n').write('\n'.join(lines) + '\n')
    print(f'wrote {A.out}: {len(altitudes)} altitudes, {sum(len(a["weights"]) for a in altitudes)} weight tables')


if __name__ == '__main__':
    main()
