#!/usr/bin/env python3
"""Glyph-reader for second-segment climb-gradient sheets (5 weights/sheet, 4 altitude blocks/sheet,
variable temperature rows per altitude). Output: JSON {"<sheet>/<block>": {"temps":[..], "rows":[[25 values]..]}}.
Digits are read without the decimal point (value = int/10). Uncertain glyphs give null.
Usage: read_gradient_grid.py PDF OUT.json [--sheets 0,1,2,3]"""
import sys, os, json, warnings
warnings.filterwarnings('ignore')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
import glyphs as g
import read_pages as rp


def lines(a):
    H, W = a.shape
    hl = g.open1d(a[:, W // 10: W * 9 // 10], int(W * .6), 1).any(axis=1)
    grp = g._groups(np.nonzero(hl)[0])
    thick = [(x[0], x[-1]) for x in grp if x[-1] - x[0] >= 4]
    vl = g.open1d(a[thick[0][1]:thick[-1][0]], 300, 0).any(axis=0)
    xg = g._groups(np.nonzero(vl)[0])
    return thick, [(x[0], x[-1]) for x in xg]


def read_sheet(gray):
    m, a, _ = g.glyph_mask(gray)
    thick, vx = lines(a)
    comps = [p for c in g.components(m) for p in rp.split_wide(c)]
    # panel edges: thick vertical frame lines + thin vertical separators
    xs = [x[0] for x in vx]
    return m, a, thick, vx, comps


def cell_text(cs, maxd=99):
    cs = sorted(cs, key=lambda c: c[0])
    out, bad = '', False
    for c in cs:
        ch, dist = rp.classify(*c, maxd)
        if ch == '?' or dist > maxd:
            bad = True
        out += ch if ch != '?' else '?'
    return out, bad


def to_val(t):
    if not t or '?' in t:
        return None
    neg = t.startswith('-')
    dg = t.lstrip('-')
    if not dg.isdigit():
        return None
    return (-1 if neg else 1) * int(dg) / 10


def read_pdf(pdf, sheets, blocks=4):
    import fitz
    from PIL import Image
    d = fitz.open(pdf)
    res = {}
    for i in sheets:
        pix = d[i].get_pixmap(dpi=300)
        gray = np.array(Image.frombytes('RGB', (pix.width, pix.height), pix.samples).convert('L'))
        m, a, thick, vx, comps = read_sheet(gray)
        edges = [x[1] + 1 for x in vx[2:]]
        tx = (vx[1][1] + 1, vx[2][0])
        for b in range(blocks or len(thick) - 2):
            y0, y1 = thick[b + 1][1] + 1, thick[b + 2][0]
            sel = [c for c in comps if y0 <= c[1] < y1 and c[0] > tx[0]]
            rows = []
            for c in sorted(sel, key=lambda c: c[1] + c[3] / 2 if c[3] > 4 else c[1] + c[3] / 2 - 4):
                yc = c[1] + c[3] / 2 if c[3] > 4 else c[1] + c[3] / 2 - 4
                if rows and abs(yc - rows[-1][0]) <= 12:
                    rows[-1][1].append(c)
                    rows[-1][0] = (rows[-1][0] + yc) / 2
                else:
                    rows.append([yc, [c]])
            outrows = []
            for yc, cs in rows:
                temp_cs = [c for c in cs if c[0] < tx[1]]
                tt, _ = cell_text(temp_cs)
                vc = sorted([c for c in cs if c[0] >= tx[1]], key=lambda c: c[0])
                words, cur = [], []
                for c in vc:
                    if cur and c[0] - (cur[-1][0] + cur[-1][2]) > 18:
                        words.append(cur); cur = []
                    cur.append(c)
                if cur:
                    words.append(cur)
                vals = []
                for wd in words:
                    t, bad = cell_text(wd)
                    if t.startswith('.'):
                        t = '0' + t
                    vals.append(None if bad else to_val(t))
                outrows.append({'temp': tt, 'y': float(yc), 'vals': vals, 'n': len(words)})
            res[f'{i}/{b}'] = outrows
    return res


if __name__ == '__main__':
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument('pdf'); ap.add_argument('out')
    ap.add_argument('--sheets', default='0,1,2,3')
    ap.add_argument('--blocks', type=int, default=0, help='0 = auto from thick lines')
    A = ap.parse_args()
    r = read_pdf(A.pdf, [int(x) for x in A.sheets.split(',')], A.blocks)
    json.dump(r, open(A.out, 'w'))
    for k, v in r.items():
        print(k, len(v), sum(x is None for row in v for x in row['vals']), 'unreadable')
