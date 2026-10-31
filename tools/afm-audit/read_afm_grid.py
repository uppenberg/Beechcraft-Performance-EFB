#!/usr/bin/env python3
"""Anchor-based reader for AFM climb-gradient sheets that are raster images (no text layer).

Layout handled: [ALT | TEMP | 5 weight panels x 5 wind columns], several altitude blocks per sheet,
every value printed as "dd.d" (one decimal). Method:
  1. Render at 300 dpi, threshold, strip long ruling lines (glyphs.glyph_mask).
  2. Thick horizontal lines -> altitude blocks (count is detected per sheet).
  3. Decimal points (3x3 px blobs) are clustered in x into the 25 value columns; every digit/minus is
     attached to the nearest decimal point. This avoids all "word gap" heuristics, which fail on this layout.
  4. Digits are classified against glyph_templates.json; touching glyphs are split with read_pages.split_wide.
  5. Block altitude is assigned by sequence in the converter (build_grid_js.py); the ALT column text is only
     stored for reference. Value digits and the smaller ALT/TEMP digits use separate template sets
     (glyph_templates_afm.json / glyph_templates_afm_side.json, made with build_templates.py).
Output JSON: {"<sheet>": {"blocks": [{"altText": s, "rows": [{"temp": t, "vals": [25 floats|null],
"suspect": [col,...]}]}]}}. Every null/suspect cell must be checked visually (see crop_rows.py).

Usage: read_afm_grid.py PDF OUT.json [--sheets 0,1,..] [--maxd 7] [--cols 25]
"""
import argparse
import json
import os
import sys
import warnings

warnings.filterwarnings('ignore')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
from scipy import ndimage as ndi

import glyphs as g
import read_pages as rp

DOT_MAX = 6          # px, decimal point bounding box
ROW_TOL = 7          # px, max vertical distance to a row centre


def all_components(mask):
    lab, _ = ndi.label(mask, structure=np.ones((3, 3)))
    out = []
    for i, s in enumerate(ndi.find_objects(lab)):
        h, w = s[0].stop - s[0].start, s[1].stop - s[1].start
        if h > 40 or w > 40 or (h < 2 and w < 2):
            continue
        out.append((s[1].start, s[0].start, w, h, (lab[s] == i + 1)))
    return out


def is_dot(c):
    return c[2] <= DOT_MAX and c[3] <= DOT_MAX


def is_minus(c):
    return c[3] <= 5 and c[2] >= 9


def cluster(values, tol):
    groups = []
    for v in sorted(values):
        if groups and v - groups[-1][-1] <= tol:
            groups[-1].append(v)
        else:
            groups.append([v])
    return groups


def use(name):
    """Switch the template set used by read_pages.classify/split_wide ('value' or 'side')."""
    rp.CEN, rp.LAB = TPL[name]


def load_templates(directory=os.path.dirname(os.path.abspath(__file__))):
    for name, fn in (('value', 'glyph_templates_afm.json'), ('side', 'glyph_templates_afm_side.json')):
        T = json.load(open(os.path.join(directory, fn)))
        TPL[name] = (np.array(T['centroids'], dtype=np.float32), T['labels'])


TPL = {}


def glyph_dist(c):
    f = rp.feat(c[4], c[2], c[3])
    d = np.linalg.norm(rp.CEN - f, axis=1)
    k = np.argsort(d)[:2]
    labs = [rp.LAB[i] for i in k]
    return labs[0], float(d[k[0]]), (float(d[k[1]]) if labs[1] != labs[0] else 99.0)


def read_char(c, maxd):
    """Returns (char, suspect)."""
    if is_minus(c):
        return '-', False
    lab, d, runner = glyph_dist(c)
    return lab, d > maxd


def expand(cs):
    out = []
    for c in cs:
        out.extend(rp.split_wide(c) if (c[2] > 17 and c[3] > 5) else [c])
    return out


def geometry(gray):
    """Glyph mask, thick horizontal lines (block borders) and vertical frame lines of a sheet."""
    m, a, _ = g.glyph_mask(gray)
    H, W = a.shape
    hl = g.open1d(a[:, W // 10: W * 9 // 10], int(W * .6), 1).any(axis=1)
    thick = [(x[0], x[-1]) for x in g._groups(np.nonzero(hl)[0]) if x[-1] - x[0] >= 4]
    vl = g.open1d(a[thick[0][1]:thick[-1][0]], 300, 0).any(axis=0)
    vx = [(x[0], x[-1]) for x in g._groups(np.nonzero(vl)[0])]
    return m, thick, vx


def read_sheet(gray, maxd, ncols):
    m, thick, vx = geometry(gray)
    alt_x1, temp_x1 = vx[1][0], vx[2][0]
    comps = all_components(m)
    # one sheet-wide set of value columns from the decimal points of the data area
    data_top, data_bot = thick[1][1], thick[-1][0]
    dots = [c for c in comps if is_dot(c) and c[0] > temp_x1 and data_top < c[1] < data_bot]
    cols = [float(np.mean(gr)) for gr in cluster([c[0] + c[2] / 2 for c in dots], 12)]
    cols = [x for x, gr in zip(cols, cluster([c[0] + c[2] / 2 for c in dots], 12)) if len(gr) >= 8]
    if len(cols) != ncols:
        raise SystemExit(f'expected {ncols} value columns, found {len(cols)}')
    blocks = []
    for b in range(len(thick) - 2):
        y0, y1 = thick[b + 1][1] + 1, thick[b + 2][0]
        inb = [c for c in comps if y0 <= c[1] and c[1] + c[3] <= y1 + 1]
        digs = [c for c in inb if not is_dot(c) and not is_minus(c) and c[3] >= 12]
        rows_y = [float(np.mean(gr)) for gr in cluster([c[1] + c[3] / 2 for c in digs if c[0] > alt_x1], 6)]
        # ALT column is only informational ("1","0","0","0" = 1000 ft); the converter numbers blocks by sequence
        altc = sorted([c for c in digs if c[0] < alt_x1], key=lambda c: c[1])
        use('side')
        alt_txt = ''.join(read_char(c, 99)[0] for c in altc)
        rows = []
        for yc in rows_y:
            near = lambda c, off=0.0: abs(c[1] + c[3] / 2 - off - yc) <= ROW_TOL
            tcs = sorted([c for c in inb if alt_x1 < c[0] < temp_x1 and (near(c) if not is_dot(c) else False)], key=lambda c: c[0])
            use('side')
            tcs = expand(tcs)
            t_txt = ''.join(read_char(c, maxd)[0] for c in tcs)
            use('value')
            cells = [[] for _ in cols]
            for c in inb:
                if c[0] < temp_x1:
                    continue
                cy = c[1] + c[3] / 2
                if is_dot(c):
                    if abs(cy - 6.5 - yc) > ROW_TOL:
                        continue
                elif not near(c):
                    continue
                cx = c[0] + c[2] / 2
                dx = [cx - col for col in cols]
                k = int(np.argmin([abs(v) for v in dx]))
                if not (-40 < dx[k] < 22):
                    # glyph left of the nearest dot belongs to the next dot on the right
                    k2 = [i for i, v in enumerate(dx) if -40 < v < 22]
                    if not k2:
                        continue
                    k = k2[0]
                cells[k].append(c)
            vals, suspect = [], []
            for k, cs in enumerate(cells):
                cs = sorted(expand(cs), key=lambda c: c[0])
                txt, bad = '', False
                for c in cs:
                    if is_dot(c):
                        txt += '.'
                    else:
                        ch, sus = read_char(c, maxd)
                        txt += ch
                        bad |= sus
                import re
                ok = re.fullmatch(r'-?\d{1,2}\.\d', txt) is not None
                vals.append(float(txt) if ok else None)
                if bad or not ok:
                    suspect.append(k)
            try:
                temp = int(t_txt)
            except ValueError:
                temp = None
            rows.append({'temp': temp, 'tempText': t_txt, 'vals': vals, 'suspect': suspect, 'y': yc})
        blocks.append({'altText': alt_txt, 'rows': rows})
    return {'columns': cols, 'blocks': blocks}


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('pdf')
    ap.add_argument('out')
    ap.add_argument('--sheets', default='')
    ap.add_argument('--maxd', type=float, default=7.0)
    ap.add_argument('--cols', type=int, default=25)
    A = ap.parse_args()
    load_templates()
    import fitz
    n = len(fitz.open(A.pdf))
    sheets = [int(x) for x in A.sheets.split(',')] if A.sheets else list(range(n))
    res = {}
    for i in sheets:
        res[str(i)] = read_sheet(g.render(A.pdf, i), A.maxd, A.cols)
        for b in res[str(i)]['blocks']:
            bad = sum(len(r['suspect']) for r in b['rows'])
            print(f"sheet {i} alt column {b['altText']!r} rows {len(b['rows'])} suspect cells {bad}")
    json.dump(res, open(A.out, 'w'))


if __name__ == '__main__':
    main()
