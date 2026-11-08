#!/usr/bin/env python3
"""Render AFM gradient cells (full 5-wind row) into review sheets for visual checks.

Keys use the same altitude/weight/temp/wind form as read_gradient.py --corrections.
The proposed value (if any) is printed on each tile; the wind column to compare is
named in the label.
"""
import argparse
import json

import fitz
from PIL import Image, ImageDraw

from read_gradient import altitude_row_offset, temperatures_for_altitude

WINDS = (-10, 0, 10, 20, 30)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("pdf")
    parser.add_argument("--profile", required=True)
    parser.add_argument("--keys", required=True, help="JSON object (key -> proposed value) or list of keys")
    parser.add_argument("--output-prefix", required=True)
    parser.add_argument("--chunk", type=int, default=14)
    args = parser.parse_args()

    with open(args.profile, encoding="utf-8") as file:
        profile = json.load(file)
    with open(args.keys, encoding="utf-8") as file:
        keys = json.load(file)
    proposed = keys if isinstance(keys, dict) else {key: None for key in keys}
    document = fitz.open(args.pdf)
    pages = {}
    tiles = []
    for key, value in sorted(proposed.items()):
        altitude, weight, temp, wind = map(int, key.split("/"))
        page_index = next(
            index for index, base in enumerate(profile["pageAltitudes"])
            if base <= altitude < base + profile["pageAltitudeCounts"][index] * profile["altitudeStepFt"]
            and weight in profile["pageWeights"][index % len(profile["pageWeights"])]
        )
        if page_index not in pages:
            pixmap = document[page_index].get_pixmap(dpi=600, alpha=False)
            pages[page_index] = Image.frombytes("RGB", (pixmap.width, pixmap.height), pixmap.samples)
        band = dict(
            profile,
            _pageBaseAltitude=profile["pageAltitudes"][page_index],
            _altitudeBandStep600Dpi=profile.get("altitudeBandStep600Dpi", 0),
        )
        first = WINDS.index(wind)
        column = profile["pageWeights"][page_index % len(profile["pageWeights"])].index(weight) * 5
        offset = profile["pageXOffsets600Dpi"][page_index]
        row = temperatures_for_altitude(profile, altitude).index(temp)
        y = profile["firstRowY600Dpi"] + altitude_row_offset(band, altitude) + row * profile["rowStep600Dpi"]
        crop = pages[page_index].crop((
            profile["xCenters600Dpi"][column] + offset - 80, y - 70,
            profile["xCenters600Dpi"][column + 4] + offset + 80, y + 70,
        ))
        tile = Image.new("RGB", (crop.width, crop.height + 24), "white")
        tile.paste(crop, (0, 24))
        ImageDraw.Draw(tile).text(
            (4, 4),
            f"{key} proposed={value} -> column #{first + 1} of 5 (winds -10,0,10,20,30), page {page_index + 1}",
            fill="red",
        )
        tiles.append(tile)
    for number, start in enumerate(range(0, len(tiles), args.chunk), 1):
        group = tiles[start:start + args.chunk]
        sheet = Image.new("RGB", (max(t.width for t in group), sum(t.height for t in group)), "white")
        y = 0
        for tile in group:
            sheet.paste(tile, (0, y))
            y += tile.height
        sheet.save(f"{args.output_prefix}-{number}.png")
    print(f"Wrote {len(tiles)} tiles in {-(-len(tiles) // args.chunk)} sheets")


if __name__ == "__main__":
    main()
