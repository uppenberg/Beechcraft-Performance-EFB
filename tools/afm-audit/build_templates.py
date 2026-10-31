#!/usr/bin/env python3
"""Builds a glyph template set for a raster AFM PDF family by k-means clustering and writes a
labelling montage. Workflow (done once per font/scale, then reuse the templates):
  1. build_templates.py cluster PDF[,PDF..] OUT_PREFIX [K] [value|side]   -> OUT_PREFIX.clusters.npz + OUT_PREFIX.montage.png
  2. Look at the montage once, write the digit for each cluster index into OUT_PREFIX.labels.json
     (e.g. {"0": "1", "1": "6", ...}; use "." for decimal point if needed, "-" for minus, "?" for junk).
  3. build_templates.py save OUT_PREFIX templates.json   -> {"centroids": [...], "labels": [...]}
"""
import json
import os
import sys
import warnings

warnings.filterwarnings('ignore')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
from PIL import Image, ImageDraw
from sklearn.cluster import KMeans

import glyphs as g
import read_afm_grid as R
import read_pages as rp


def collect(pdfs, region):
    """region 'value' = the 25 data columns, 'side' = ALT and TEMP columns (smaller font)."""
    feats, meta = [], []
    import fitz
    for pdf in pdfs:
        for i in range(len(fitz.open(pdf))):
            gray = g.render(pdf, i)
            m, thick, vx = R.geometry(gray)
            temp_x1 = vx[2][0]
            for c in R.all_components(m):
                if R.is_dot(c) or R.is_minus(c) or c[3] < 12 or c[2] > 17:
                    continue
                if not thick[1][1] < c[1] < thick[-1][0] or (c[0] >= temp_x1) != (region == 'value'):
                    continue
                feats.append(rp.feat(c[4], c[2], c[3]))
                meta.append((os.path.basename(pdf), i, c[0], c[1], c[2], c[3]))
    return np.array(feats, np.float32), meta


def cluster(pdfs, prefix, k, region):
    X, meta = collect(pdfs, region)
    km = KMeans(k, n_init=4, random_state=0).fit(X)
    np.savez(prefix + '.clusters.npz', X=X, labels=km.labels_, centroids=km.cluster_centers_)
    json.dump(meta, open(prefix + '.meta.json', 'w'))
    cell, cols = 20 * 4 + 6, 10
    rows = (k + cols - 1) // cols
    img = Image.new('L', (cols * (cell + 40), rows * (cell + 14)), 255)
    d = ImageDraw.Draw(img)
    for j in range(k):
        c = km.cluster_centers_[j].reshape(20, 20)
        im = Image.fromarray((255 - c * 255).astype(np.uint8)).resize((80, 80), Image.NEAREST)
        x, y = (j % cols) * (cell + 40), (j // cols) * (cell + 14)
        img.paste(im, (x + 22, y + 12))
        d.text((x + 2, y), f'#{j} n={int((km.labels_ == j).sum())}', fill=0)
    img.save(prefix + '.montage.png')
    print('clusters', k, 'glyphs', len(X), 'inertia', km.inertia_)


def save(prefix, out):
    z = np.load(prefix + '.clusters.npz')
    lab = json.load(open(prefix + '.labels.json'))
    keep = [j for j in range(len(z['centroids'])) if lab.get(str(j), '?') != '?']
    json.dump({'centroids': [z['centroids'][j].tolist() for j in keep], 'labels': [lab[str(j)] for j in keep]}, open(out, 'w'))
    print('saved', len(keep), 'templates')


if __name__ == '__main__':
    cmd = sys.argv[1]
    if cmd == 'cluster':
        cluster(sys.argv[2].split(','), sys.argv[3], int(sys.argv[4]) if len(sys.argv) > 4 else 40,
                sys.argv[5] if len(sys.argv) > 5 else 'value')
    else:
        save(sys.argv[2], sys.argv[3])
