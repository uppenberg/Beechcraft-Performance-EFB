"""Glyf-extraktion för AFM-sidor (300 dpi, rastrerade tabeller utan textlager)."""
import numpy as np
import fitz
from PIL import Image
from scipy import ndimage as ndi

DPI = 300
DIL = 0


def render(pdf, page_index):
    d = fitz.open(pdf)
    p = d[page_index]
    pix = p.get_pixmap(dpi=DPI)
    img = Image.frombytes('RGB', (pix.width, pix.height), pix.samples).convert('L')
    return np.array(img)


def open1d(a, n, axis):
    m = ndi.minimum_filter1d(a.astype(np.uint8), n, axis=axis)
    return ndi.maximum_filter1d(m, n, axis=axis) > 0


def glyph_mask(gray, thr=140):
    a = gray < thr
    lines = open1d(a, 60, 1) | open1d(a, 60, 0)
    return a & ~(ndi.binary_dilation(lines, iterations=DIL) if DIL else lines), a, lines


def components(mask):
    lab, n = ndi.label(mask, structure=np.ones((3, 3)))
    out = []
    for i, s in enumerate(ndi.find_objects(lab)):
        h = s[0].stop - s[0].start
        w = s[1].stop - s[1].start
        if h > 40 or w > 40 or (h < 14 and w < 8):
            continue
        out.append((s[1].start, s[0].start, w, h, (lab[s] == i + 1)))
    return out


def _groups(idx, gap=2):
    g = []
    for y in idx:
        if g and y - g[-1][-1] <= gap:
            g[-1].append(y)
        else:
            g.append([y])
    return g


def geometry(a):
    """Returnerar (block, thin, ramx): block = [(topp, datastart, botten)] i y,
    ramx = x för tjocka vertikala ramar, thin = tunna horisontella linjer."""
    H, W = a.shape
    hl = open1d(a[:, :W // 2], 600, 1).any(axis=1)
    groups = _groups(np.nonzero(hl)[0])
    thick = [(g[0], g[-1]) for g in groups if g[-1] - g[0] >= 4]
    thin = [g[0] for g in groups if g[-1] - g[0] < 4]
    blocks = [thick[i:i + 3] for i in range(0, len(thick) - 2, 3)]
    vl = open1d(a, 200, 0).any(axis=0)
    xg = _groups(np.nonzero(vl)[0])
    ramx = [g[0] for g in xg if g[-1] - g[0] >= 4]
    return blocks, thin, ramx
