#!/usr/bin/env python3
"""Montage of AFM climb-gradient table row strips, for visual verification of OCR cells.

Keys are altitude/weight/temp (e.g. 1000/20000/-25). Each strip shows the weight
panel row at 600 dpi with the wind columns -10..30 left to right, labelled with the key.
Usage: crop_gradient_rows.py PDF PROFILE.json OUT.png KEY [KEY ...]
"""
import json
import sys

import fitz
from PIL import Image, ImageDraw


def main():
    pdf, profile_path, out, *keys = sys.argv[1:]
    profile = json.load(open(profile_path, encoding="utf-8"))
    document = fitz.open(pdf)
    cache = {}
    strips = []
    for key in keys:
        altitude, weight, temp = (int(part) for part in key.split("/"))
        page_index = max(
            i for i, base in enumerate(profile["pageAltitudes"])
            if base <= altitude
            and weight in profile["pageWeights"][i % len(profile["pageWeights"])]
        )
        base = profile["pageAltitudes"][page_index]
        weight_index = profile["pageWeights"][page_index % len(profile["pageWeights"])].index(weight)
        if page_index not in cache:
            pix = document[page_index].get_pixmap(dpi=600, alpha=False)
            cache[page_index] = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
        image = cache[page_index]
        offset = profile["pageXOffsets600Dpi"][page_index]
        x0 = profile["xCenters600Dpi"][weight_index * 5] + offset - profile["weightPanelLeftPadding600Dpi"]
        band = (altitude - base) // profile["altitudeStepFt"]
        row = profile["temperatures"].index(temp)
        y = profile["firstRowY600Dpi"] + band * profile["altitudeBandStep600Dpi"] + row * profile["rowStep600Dpi"]
        step = profile["rowStep600Dpi"]
        strip = image.crop((x0, y - step, x0 + profile["weightPanelWidth600Dpi"], y + step))
        canvas = Image.new("RGB", (strip.width, strip.height + 40), "white")
        ImageDraw.Draw(canvas).text((4, 2), f"{key}  (page {page_index + 1})", fill="red")
        canvas.paste(strip, (0, 40))
        strips.append(canvas)
    sheet = Image.new("RGB", (max(s.width for s in strips), sum(s.height for s in strips)), "white")
    y = 0
    for strip in strips:
        sheet.paste(strip, (0, y))
        y += strip.height
    sheet.save(out)


if __name__ == "__main__":
    main()
