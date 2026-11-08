#!/usr/bin/env python3
"""Bygger kontrollbilder: raderna som flaggats (status>0 i OUT.rows.json eller via --specs) som beskärningar
med avläst text ovanför, så att de kan jämföras visuellt mot PDF:en.
  crop.py PDF OUT.rows.json OUTPREFIX [--all-status] [--per 10]
"""
import sys, os, json, warnings
warnings.filterwarnings('ignore')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import fitz
from PIL import Image, ImageDraw, ImageFont
args = sys.argv[1:]
pdf, rj, pre = args[0], args[1], args[2]
per = int(args[args.index('--per') + 1]) if '--per' in args else 10
rows = [r for r in json.load(open(rj)) if r['status'] > 0 or '--all' in args]
doc = fitz.open(pdf)
cache = {}
tiles = []
for r in rows:
    if r['page'] not in cache:
        pix = doc[r['page']].get_pixmap(dpi=300)
        cache[r['page']] = Image.frombytes('RGB', (pix.width, pix.height), pix.samples)
    im = cache[r['page']].crop((r['x0'], r['y0'] - 6, r['x0'] + 958, r['y1'] + 6))
    t = Image.new('RGB', (958, im.height + 28), 'white')
    ImageDraw.Draw(t).text((4, 2), f"{r['spec']}  {r['text']}", fill='red', font=ImageFont.load_default(size=20))
    t.paste(im, (0, 28)); tiles.append(t)
for i in range(0, len(tiles), per):
    chunk = tiles[i:i + per]
    H = sum(t.height for t in chunk)
    m = Image.new('RGB', (958, H), 'white'); y = 0
    for t in chunk:
        m.paste(t, (0, y)); y += t.height
    m.save(f'{pre}-{i // per + 1:02d}.png')
print(len(tiles), 'rader')
