#!/usr/bin/env python3
"""Re-OCR only the gaps (missing/unparsed cells) listed in a read_gradient.py .todo file.

Each cell is cropped from a high-DPI render and read with several preprocessing
variants and Tesseract modes. A value is accepted only when at least --min-votes
independent reads agree; the result is written as a --corrections JSON for
read_gradient.py. Cells without a consensus stay in the .todo for visual review.
"""
import argparse
import collections
import io
import json
import os
import re
import subprocess
from concurrent.futures import ThreadPoolExecutor

import fitz
from PIL import Image, ImageOps

from read_gradient import altitude_row_offset, parse_value, temperatures_for_altitude

LINE = re.compile(
    r"page (\d+), altitude (\d+), weight (\d+), temp (-?\d+), wind (-?\d+): (missing|unparsed)"
)
DPI = 600


def tesseract(image, psm):
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    env = dict(os.environ, OMP_THREAD_LIMIT="1")
    result = subprocess.run(
        ["tesseract", "stdin", "stdout", "--psm", str(psm),
         "-c", "tessedit_char_whitelist=0123456789.-"],
        input=buffer.getvalue(), capture_output=True, check=False, env=env,
    )
    return result.stdout.decode("utf-8", errors="replace").strip()


def variants(cell):
    gray = ImageOps.grayscale(cell)
    for scale, threshold in ((2, None), (3, None), (3, 150), (4, 175)):
        big = gray.resize((gray.width * scale, gray.height * scale), Image.LANCZOS)
        if threshold:
            big = big.point(lambda p, t=threshold: 255 if p > t else 0)
        yield f"x{scale}t{threshold}", ImageOps.expand(big, border=20, fill=255)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("pdf")
    parser.add_argument("todo")
    parser.add_argument("--profile", required=True)
    parser.add_argument("--output", required=True, help="Corrections JSON to write")
    parser.add_argument("--max-altitude", type=int, default=6000)
    parser.add_argument("--min-votes", type=int, default=4)
    parser.add_argument("--half-width", type=int, default=60)
    parser.add_argument("--half-height", type=int, default=24)
    args = parser.parse_args()

    with open(args.profile, encoding="utf-8") as file:
        profile = json.load(file)
    document = fitz.open(args.pdf)
    pages = {}
    accepted, rejected = {}, []
    with open(args.todo, encoding="utf-8") as file:
        entries = [m.groups() for m in map(LINE.match, file.read().splitlines()) if m]
    for page_no, altitude, weight, temp, wind, _reason in entries:
        page_no, altitude, weight, temp, wind = map(int, (page_no, altitude, weight, temp, wind))
        if altitude > args.max_altitude:
            continue
        page_index = page_no - 1
        if page_index not in pages:
            pixmap = document[page_index].get_pixmap(dpi=DPI, alpha=False)
            pages[page_index] = Image.frombytes("RGB", (pixmap.width, pixmap.height), pixmap.samples)
        image = pages[page_index]
        weights = profile["pageWeights"][page_index % len(profile["pageWeights"])]
        column = weights.index(weight) * 5 + (-10, 0, 10, 20, 30).index(wind)
        center_x = profile["xCenters600Dpi"][column] + profile["pageXOffsets600Dpi"][page_index]
        band = dict(
            profile,
            _pageBaseAltitude=profile["pageAltitudes"][page_index],
            _altitudeBandStep600Dpi=profile.get("altitudeBandStep600Dpi", 0),
        )
        row = temperatures_for_altitude(profile, altitude).index(temp)
        center_y = (
            profile["firstRowY600Dpi"]
            + altitude_row_offset(band, altitude)
            + row * profile["rowStep600Dpi"]
        )
        jobs = []
        for dy in (-6, 0, 6):
            cell = image.crop((
                center_x - args.half_width, center_y - args.half_height + dy,
                center_x + args.half_width, center_y + args.half_height + dy,
            ))
            for _name, variant in variants(cell):
                jobs += [(variant, psm) for psm in (7, 8)]
        with ThreadPoolExecutor(max_workers=4) as pool:
            texts = list(pool.map(lambda job: tesseract(*job), jobs))
        votes = collections.Counter(
            v for v in (parse_value(t, profile["valueRange"]) for t in texts) if v is not None
        )
        key = f"{altitude}/{weight}/{temp}/{wind}"
        if votes and votes.most_common(1)[0][1] >= args.min_votes and (
            len(votes) == 1 or votes.most_common(1)[0][1] >= 2 * votes.most_common(2)[1][1]
        ):
            accepted[key] = votes.most_common(1)[0][0]
        else:
            rejected.append((key, dict(votes)))

    with open(args.output, "w", encoding="utf-8", newline="\n") as file:
        json.dump(accepted, file, indent=2, sort_keys=True)
    print(f"Accepted {len(accepted)} cells; {len(rejected)} without consensus")
    for key, votes in rejected:
        print(f"  no consensus {key}: {votes}")


if __name__ == "__main__":
    main()
