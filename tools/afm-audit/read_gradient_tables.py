"""Read the runway-gradient correction tables (AFM Figures 4-74 ... 4-274) from the raster pages and diff them
against the data in data/c56x/takeoff-gradient-{dry,wet}.js.

Digits are segmented as connected components, clustered into 10 classes and each cluster is labelled by majority
vote against the code data. Cells that disagree with the code are listed; check them visually on out/grad/*.png.
  python tools/afm-audit/read_gradient_tables.py            (needs out/grad/<key>.png, see README)
"""
import json, subprocess, sys, os
import numpy as np
from PIL import Image
from scipy import ndimage
from sklearn.cluster import KMeans

HERE = os.path.dirname(os.path.abspath(__file__))
GRAD = os.path.join(HERE, 'out', 'grad')

# key -> (const name in the data files)
TABLES = {
    'f7on': 'takeoffFieldLengthGradient_Dry_Flaps7_AntiIceOn',
    'f15off': 'takeoffFieldLengthGradient_Dry_Flaps15_AntiIceOff',
    'f15on': 'takeoffFieldLengthGradient_Dry_Flaps15_AntiIceOn',
    'f15wetoff': 'takeoffFieldLengthGradient_Wet_Flaps15_AntiIceOff',
    'f15weton': 'takeoffFieldLengthGradient_Wet_Flaps15_AntiIceOn',
    'f15wetrevoff': 'takeoffFieldLengthGradient_Wet_WithReversers_Flaps15_AntiIceOff',
    'f15wetrevon': 'takeoffFieldLengthGradient_WetWithReversers_Flaps15_AntiIceOn',
    'f7wetrev_on': 'takeoffGradientAdjustment_reversers_wet_Flaps7_AntiIceOn.data',
    'f7wetrevoff': 'takeoffGradientAdjustment_wet_reversers_Flaps7_AntiIceOff.data',
}
UP = ['2.0%', '1.5%', '1.0%', '0.5%']


def code_rows():
    return json.loads(subprocess.check_output(['node', os.path.join(HERE, 'dump-gradient-tables.js')], text=True))


def flat(r):
    g = lambda o, k: (o or {}).get(k)
    return [r['baseFieldLength'], *[g(r['uphill'], k) for k in UP], g(r['downhillShaded'], '-1%'), g(r['downhillShaded'], '-2%'),
            g(r['downhillNonShaded'], '-1%'), g(r['downhillNonShaded'], '-2%')]


def components(path):
    im = np.array(Image.open(path).convert('L'))
    ink = im > 128  # source pages are white-on-black
    lab, n = ndimage.label(ink)
    objs = ndimage.find_objects(lab)
    comps = []
    for i, sl in enumerate(objs):
        h = sl[0].stop - sl[0].start
        w = sl[1].stop - sl[1].start
        if 14 <= h <= 40 and 3 <= w <= 30:
            mask = (lab[sl] == i + 1)
            comps.append((sl[0].start, sl[0].stop, sl[1].start, sl[1].stop, mask))
    return comps


def feat(mask):
    img = Image.fromarray((mask * 255).astype('uint8')).resize((14, 22), Image.BILINEAR)
    return np.asarray(img, dtype=float).ravel() / 255


def main():
    code = code_rows()
    out = {}
    for key in TABLES:
        path = os.path.join(GRAD, key + '.png')
        comps = components(path)
        out[key] = comps
    # group glyphs into text lines by y centre
    page_lines = {}
    for key, cs in out.items():
        items = sorted(([c, None] for c in cs), key=lambda t: (t[0][0] + t[0][1]) / 2)
        lines, cur = [], []
        for t in items:
            yc = (t[0][0] + t[0][1]) / 2
            if cur and abs(yc - np.mean([(x[0][0] + x[0][1]) / 2 for x in cur])) > 10:
                lines.append(cur); cur = []
            cur.append(t)
        if cur: lines.append(cur)
        page_lines[key] = lines
    parsed = {}
    for key, lines in page_lines.items():
        rows = []
        for ln in lines:
            ln.sort(key=lambda t: t[0][2])
            nums, cur = [], [ln[0]]
            for t in ln[1:]:
                if t[0][2] - cur[-1][0][3] > 14:
                    nums.append(cur); cur = []
                cur.append(t)
            nums.append(cur)
            rows.append(nums)
        parsed[key] = rows
    # training glyphs: the first column (field length) is known from the code in ascending order
    train_x, train_y = [], []
    for key, rows in parsed.items():
        bases = [r['baseFieldLength'] for r in code[key]]
        firsts = [nums for nums in rows if nums and 4 <= len(nums[0]) <= 5 and len(nums) >= 4]
        k = 0
        for nums in firsts:
            if k >= len(bases): break
            s = str(bases[k])
            if len(nums[0]) == len(s):
                for g, ch in zip(nums[0], s):
                    train_x.append(feat(g[0][4])); train_y.append(int(ch))
                k += 1
    train_x, train_y = np.array(train_x), np.array(train_y)
    print('träningsglyfer', len(train_y), 'per siffra', np.bincount(train_y).tolist())
    for rows in parsed.values():
        for nums in rows:
            for n in nums:
                for g in n:
                    d = ((train_x - feat(g[0][4])) ** 2).sum(axis=1)
                    g[1] = int(train_y[int(np.argmin(d))])
    mapping = {d: d for d in range(10)}
    # read & compare
    report = {}
    for key, rows in parsed.items():
        crow = {r['baseFieldLength']: flat(r) for r in code[key]}
        # column centres from the widest rows
        cen = []
        for nums in rows:
            if len(nums) == 9:
                cen.append([np.mean([g[0][2] + g[0][3] for g in n]) / 2 for n in nums])
        if not cen:
            print(key, 'no full rows'); continue
        cen = np.median(np.array(cen), axis=0)
        found = {}
        ypos = {}
        for nums in rows:
            if len(nums) < 2: continue
            vals = [(np.mean([g[0][2] + g[0][3] for g in n]) / 2, int(''.join(str(mapping[g[1]]) for g in n))) for n in nums]
            if not (1000 <= vals[0][1] <= 20000) or abs(vals[0][0] - cen[0]) > 60: continue
            row = [None] * 9
            for x, v in vals:
                j = int(np.argmin(abs(cen - x)))
                row[j] = v
            found[row[0]] = row
            ypos[row[0]] = int(np.mean([(g[0][0] + g[0][1]) / 2 for g in nums[0]]))
        diffs = []
        for base, row in found.items():
            if base not in crow:
                diffs.append(f'  base {base} finns inte i koden: {row}')
                continue
            cr = crow[base]
            d = [(i, row[i], cr[i]) for i in range(9) if row[i] != cr[i]]
            if d: diffs.append(f'  base {base} (y={ypos[base]}): ' + ', '.join(f'kol{i} AFM {a} kod {b}' for i, a, b in d))
        missing = [b for b in crow if b not in found]
        report[key] = (len(found), len(crow), diffs, missing)
        print(f'## {key}: lästa rader {len(found)}, kodrader {len(crow)}')
        print('\n'.join(diffs) or '  inga avvikelser')
        if missing: print('  rader i koden som inte lästes:', missing)

if __name__ == '__main__':
    main()
