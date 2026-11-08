#!/usr/bin/env python3
"""Läser AFM-takeoffsidor (rastrerade, 2 block/rad) till batchfil utan tesseract.

  python3 read_pages.py PDF TAG OUT.txt --weights 20000,19500,... [--two-per-alt] [--pages 1,2]

Klassificerar varje tecken mot glyph_templates.json (k-means-centroider märkta visuellt).
Osäkra tecken (avstånd till mall > --maxd, standard 4.5, t.ex. rastrerade/skuggade celler)
utelämnas ur OUT och listas i OUT.todo (OSÄKER/FEL). Dessa ska läsas visuellt (se crop.py) och rättas i batchfilen innan compare/apply.
Kräver venv: python3 -m venv --system-site-packages /tmp/afmenv && /tmp/afmenv/bin/pip install pymupdf scipy pillow numpy
"""
import sys, os, json, warnings
warnings.filterwarnings('ignore')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
import glyphs as g

T = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'glyph_templates.json')))
CEN = np.array(T['centroids'], dtype=np.float32)
LAB = T['labels']
OFFS = [0, 78, 225, 374, 529, 678, 833, 958]
GAP = 14
HARD = 12.0  # över detta → '?'


def feat(bm, w, h):
    c = np.zeros((20, 20), np.float32)
    c[:min(h, 20), :min(w, 20)] = bm[:20, :20]
    return c.ravel()


def classify(x, y, w, h, bm, maxd):
    if h <= 4 and w >= 10:
        return '-', 0.0
    f = feat(bm, w, h)
    d = np.linalg.norm(CEN - f, axis=1)
    k = int(np.argmin(d))
    if LAB[k] == '-':
        return '-', float(d[k])
    return (LAB[k] if d[k] <= HARD else '?'), float(d[k])


def split_wide(c):
    """Delar sammansmälta tecken (bredare än en siffra) vid minimum i kolumnprojektionen."""
    x, y, w, h, bm = c
    if w <= 17 or h <= 4:
        return [c]
    n = max(2, int(round((w + 1) / 14)))
    if n == 2:
        best = None
        for t in range(4, w - 3):
            L, R = bm[:, :t], bm[:, t:]
            dl = classify(x, y, t, h, L, 99)[1]
            dr = classify(x + t, y, w - t, h, R, 99)[1]
            if best is None or dl + dr < best[0]:
                best = (dl + dr, t)
        cuts = [best[1]]
    else:
        cuts, prev = [], 0
        proj = bm.sum(axis=0)
        for i in range(1, n):
            t = int(round(i * w / n))
            lo, hi = max(prev + 4, t - 4), min(w - 4, t + 4)
            cut = lo + int(np.argmin(proj[lo:hi + 1])) if hi >= lo else t
            cuts.append(cut); prev = cut
    edges = [0] + cuts + [w]
    out = []
    for a_, b_ in zip(edges[:-1], edges[1:]):
        sub = bm[:, a_:b_]
        out.append((x + a_, y, b_ - a_, h, sub))
    return out


def read_page(gray, ws, maxd):
    m, a, _ = g.glyph_mask(gray)
    blocks, thin, ramx = g.geometry(a)
    comps = [p for c in g.components(m) for p in split_wide(c)]
    out = []
    k = 0
    for top, ds, bot in blocks:
        for x0 in ramx[:2]:
            sel = [c for c in comps if x0 <= c[0] < x0 + 958 and ds[1] <= c[1] < bot[0]
                   and not (c[3] <= 4 and c[0] - x0 > 78)]
            sel.sort(key=lambda c: c[1] + c[3] / 2)
            rows, cur, cy = [], [], None
            for c in sel:
                yc = c[1] + c[3] / 2 if c[3] > 4 else None
                if yc is None:
                    # minus: ligger lågt, snappa till närmaste rad
                    yc = c[1] + c[3] / 2 - 2
                if cy is None or abs(yc - cy) <= 12:
                    cur.append(c); cy = yc if cy is None else (cy + yc) / 2
                else:
                    rows.append(cur); cur = [c]; cy = yc
            if cur: rows.append(cur)
            weight = ws[k] if ws and k < len(ws) else 0
            k += 1
            out.append((weight, []))
            for r in rows:
                r.sort(key=lambda c: c[0])
                words, cw = [], None
                status = 0
                for c in r:
                    ch, d = classify(*c, maxd)
                    if ch == '?': status = 2
                    elif d > maxd: status = max(status, 1)
                    if cw and c[0] - cw[1] <= GAP:
                        cw[0] += ch; cw[1] = c[0] + c[2]
                    else:
                        cw = [ch, c[0] + c[2]]; words.append(cw)
                ws_ = [w_[0] for w_ in words]
                if len(ws_) == 13:
                    ds_ = [ws_[i] for i in (2, 4, 6, 8, 10)]
                    v_ = [ws_[i] for i in (1, 3, 5, 7, 9, 11)]
                    if any(len(x.lstrip('-')) != 4 for x in ds_) or any(len(x) not in (2, 3) for x in v_) or len(ws_[12]) != 3 or len(ws_[0].lstrip('-')) not in (1, 2):
                        status = 2
                out[-1][1].append(([w_[0] for w_ in words], status, (x0, min(c[1] for c in r), max(c[1] + c[3] for c in r))))
    return out


def main():
    args = sys.argv[1:]
    pdf, tag, outp = args[0], args[1], args[2]
    two = '--two-per-alt' in args
    ws = [int(x) for x in args[args.index('--weights') + 1].split(',')] if '--weights' in args else None
    maxd = float(args[args.index('--maxd') + 1]) if '--maxd' in args else 4.5
    import fitz
    n = len(fitz.open(pdf))
    pages = [int(x) - 1 for x in args[args.index('--pages') + 1].split(',')] if '--pages' in args else range(n)
    lines, todo, posl = [], [], []
    stats = {'ok': 0, 'fel': 0, 'osaker': 0, 'verifiera': 0}
    for pi in pages:
        gray = g.render(pdf, pi)
        alt = (pi // 2 if two else pi) * 1000
        pw = None
        if ws:
            if two:
                half = len(ws) // 2
                pw = ws[:half] if pi % 2 == 0 else ws[half:]
            else:
                pw = ws
        for weight, rows in read_page(gray, pw, maxd):
            lines.append(f'{tag}:{alt}|{weight}')
            todo.append(f'## {tag}:{alt}|{weight}  (sida {pi + 1})')
            for words, status, pos in rows:
                s = ' '.join(words)
                posl.append({'spec': f'{tag}:{alt}|{weight}', 'page': pi, 'x0': int(pos[0]), 'y0': int(pos[1]), 'y1': int(pos[2]), 'text': s, 'status': status})
                if len(words) != 13:
                    todo.append(f'FEL({len(words)}) {s}'); stats['fel'] += 1
                elif status == 2:
                    todo.append(f'OSÄKER {s}'); stats['osaker'] += 1
                elif status == 1:
                    todo.append(f'VERIFIERA {s}'); lines.append(s); stats['verifiera'] += 1
                else:
                    lines.append(s); stats['ok'] += 1
        print('sida', pi + 1, stats, file=sys.stderr, flush=True)
    open(outp, 'w').write('\n'.join(lines) + '\n')
    json.dump(posl, open(outp + '.rows.json', 'w'))
    open(outp + '.todo', 'w').write('\n'.join(todo) + '\n')


if __name__ == '__main__':
    main()
