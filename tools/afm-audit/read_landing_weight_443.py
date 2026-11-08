#!/usr/bin/env python3
"""Generate OCR-only review candidates for Figure 4-43 landing-weight tables.

The OCR values are never treated as verified AFM data. Rows with anything other
than 20 recognized weights are retained as raw text and require manual review.
"""

import argparse
import csv
import io
import json
import os
import re
import subprocess
from pathlib import Path

import pymupdf as fitz


FIGURE_LABEL = "Figure 4-43"
EXPECTED_WIDTH = 20
DETECTION_DPI = 150
EXPECTED_ROWS_0_TO_6000 = {
    0: 17,
    1000: 17,
    2000: 16,
    3000: 17,
    4000: 17,
    5000: 17,
    6000: 17,
}


def image_rect(page):
    images = page.get_images(full=True)
    if not images:
        raise ValueError("No embedded table image found on page")
    rects = page.get_image_rects(images[0][0])
    if not rects:
        raise ValueError("Could not locate embedded table image")
    return rects[0]


def horizontal_rules(page, rect):
    pix = page.get_pixmap(
        dpi=DETECTION_DPI, clip=rect, colorspace=fitz.csGRAY, alpha=False
    )
    samples = memoryview(pix.samples)
    left = int(pix.width * 0.08)
    right = int(pix.width * 0.99)
    row_width = pix.width
    columns = right - left
    ys = []
    for y in range(pix.height):
        start = y * row_width + left
        dark_pixels = sum(pixel < 90 for pixel in samples[start:start + columns])
        if dark_pixels / columns > 0.85:
            ys.append(y)
    groups = []
    for y in ys:
        if groups and y - groups[-1][-1] <= 2:
            groups[-1].append(int(y))
        else:
            groups.append([int(y)])
    return [(g[0], g[-1]) for g in groups if g[-1] - g[0] >= 1]


def table_bounds(page, rect):
    rules = horizontal_rules(page, rect)
    height = page.get_pixmap(
        dpi=DETECTION_DPI, clip=rect, colorspace=fitz.csGRAY, alpha=False
    ).height
    bounds = []
    cursor = int(height * 0.1)
    while True:
        tops = [
            i for i, (y0, _) in enumerate(rules)
            if y0 >= cursor and any(280 <= rules[j][0] - y0 <= 340
                                    for j in range(i + 1, len(rules)))
        ]
        if not tops:
            break
        top_index = tops[0]
        top = rules[top_index][0]
        bottoms = [
            rules[j][0] for j in range(top_index + 1, len(rules))
            if 280 <= rules[j][0] - top <= 340
        ]
        if not bottoms:
            break
        bottom = bottoms[0]
        bounds.append((top, bottom))
        next_tops = [
            rules[i][0] for i in range(top_index + 1, len(rules))
            if 6 <= rules[i][0] - bottom <= 20
            and any(280 <= rules[j][0] - rules[i][0] <= 340
                    for j in range(i + 1, len(rules)))
        ]
        if not next_tops:
            break
        cursor = next_tops[0]
    if len(bounds) != 3:
        raise ValueError(f"Expected 3 table regions; detected {len(bounds)}")
    scale = DETECTION_DPI / 72
    return [
        fitz.Rect(
            rect.x0,
            rect.y0 + max(0, top - 4) / scale,
            rect.x1,
            rect.y0 + min(height, bottom + 5) / scale,
        )
        for top, bottom in bounds
    ]


def ocr_candidate_rows(tsv):
    words = []
    for word in csv.DictReader(io.StringIO(tsv), delimiter="\t"):
        text = word.get("text", "").strip()
        if word.get("level") != "5" or not text:
            continue
        left, top = int(word["left"]), int(word["top"])
        width, height = int(word["width"]), int(word["height"])
        words.append({
            "text": text,
            "left": left,
            "centerX": left + width / 2,
            "centerY": top + height / 2,
        })

    weight_words = [
        word for word in words if re.fullmatch(r"\d{4,5}", word["text"])
    ]
    groups = []
    for word in sorted(weight_words, key=lambda item: item["centerY"]):
        if groups and word["centerY"] - groups[-1][-1]["centerY"] <= 8:
            groups[-1].append(word)
        else:
            groups.append([word])

    rows = []
    for group in groups:
        group.sort(key=lambda item: item["centerX"])
        y_center = sum(word["centerY"] for word in group) / len(group)
        first_weight_x = group[0]["left"]
        labels = sorted(
            (word for word in words
             if word["centerX"] < first_weight_x
             and abs(word["centerY"] - y_center) <= 10),
            key=lambda item: item["centerX"],
        )
        tokens = [word["text"] for word in group]
        rows.append({
            "temperatureLabelOCR": " ".join(word["text"] for word in labels),
            "weightCandidatesLb": (
                [int(token) for token in tokens]
                if len(tokens) == EXPECTED_WIDTH else None
            ),
            "recognizedWeightTokens": tokens,
            "recognizedWeightCount": len(tokens),
            "missingOrExtraTokens": EXPECTED_WIDTH - len(tokens),
            "reviewStatus": "unverified",
            "rawOCR": " ".join(
                [word["text"] for word in labels] + tokens
            ),
        })
    return rows


def read_table(page, bounds):
    pix = page.get_pixmap(dpi=450, clip=bounds, alpha=False)
    image = pix.tobytes("png")
    outputs = {}
    rows_by_mode = {}
    for psm in (11, 12):
        outputs[psm] = subprocess.run(
            ["tesseract", "stdin", "stdout", "--psm", str(psm), "tsv"],
            input=image,
            capture_output=True,
            check=True,
            env={**os.environ, "OMP_THREAD_LIMIT": "1"},
        ).stdout.decode("utf-8", errors="replace")
        rows_by_mode[psm] = ocr_candidate_rows(outputs[psm])

    rows = rows_by_mode[11]
    alternate_rows = rows_by_mode[12]
    for row_index, row in enumerate(rows):
        alternate_tokens = (
            alternate_rows[row_index]["recognizedWeightTokens"]
            if row_index < len(alternate_rows)
            else []
        )
        row["alternateRecognizedWeightTokens"] = alternate_tokens
        row["ocrModesAgree"] = row["recognizedWeightTokens"] == alternate_tokens
    return outputs[11], rows


def parse_altitudes(value):
    values = [int(item.strip()) for item in value.split(",") if item.strip()]
    if not values or any(alt < 0 or alt > 14000 or alt % 1000 for alt in values):
        raise argparse.ArgumentTypeError(
            "altitudes must be comma-separated thousands from 0 to 14000 ft"
        )
    if len(set(values)) != len(values):
        raise argparse.ArgumentTypeError("altitudes must not repeat")
    return values


def build_review(pdf_path, altitudes):
    document = fitz.open(pdf_path)
    if len(document) != 6:
        raise ValueError(f"Expected the supplied six-page PDF; found {len(document)} pages")

    tables = []
    for altitude in altitudes:
        sheet = altitude // 1000
        page_index = 1 + sheet // 3
        table_index = sheet % 3
        page = document[page_index]
        page_text = page.get_text()
        if FIGURE_LABEL not in page_text:
            raise ValueError(f"Page {page_index + 1} is not labeled as Figure 4-43")
        rect = image_rect(page)
        bounds = table_bounds(page, rect)
        table_rect = bounds[table_index]
        ocr, rows = read_table(page, table_rect)
        expected_rows = EXPECTED_ROWS_0_TO_6000.get(altitude)
        tables.append({
            "altitudeFt": altitude,
            "sourcePage": page_index + 1,
            "tableIndexOnPage": table_index + 1,
            "sourceRegionPdfPoints": [
                round(table_rect.x0, 2),
                round(table_rect.y0, 2),
                round(table_rect.x1, 2),
                round(table_rect.y1, 2),
            ],
            "figure": FIGURE_LABEL,
            "antiIce": "OFF",
            "approachFlapsDeg": 15,
            "landingFlapsDeg": 35,
            "windKnots": [-10, 0, 10, 20, 30],
            "runwayGradientPercent": [-2, 0, 1, 2],
            "expectedWeightsPerTemperatureRow": EXPECTED_WIDTH,
            "expectedTemperatureRowCount": expected_rows,
            "rowCountMatchesExpected": (
                len(rows) == expected_rows if expected_rows is not None else None
            ),
            "ocrRows": rows,
            "rawOCRTsv": ocr,
        })

    expected_cells = None
    expected_rows = None
    if all(altitude in EXPECTED_ROWS_0_TO_6000 for altitude in altitudes):
        expected_rows = sum(EXPECTED_ROWS_0_TO_6000[altitude] for altitude in altitudes)
        expected_cells = expected_rows * EXPECTED_WIDTH
    recognized_tokens = sum(
        row["recognizedWeightCount"]
        for table in tables
        for row in table["ocrRows"]
    )
    incomplete_rows = sum(
        row["recognizedWeightCount"] != EXPECTED_WIDTH
        for table in tables
        for row in table["ocrRows"]
    )
    disagreeing_rows = sum(
        not row["ocrModesAgree"]
        for table in tables
        for row in table["ocrRows"]
    )
    return {
        "artifactType": "AFM OCR candidates; not runtime data",
        "sourcePdf": str(Path(pdf_path)),
        "figure": FIGURE_LABEL,
        "verificationPolicy": (
            "OCR is candidate generation only. Every candidate cell remains "
            "unverified until checked against a rendered PDF region."
        ),
        "coverage": {
            "altitudesFt": altitudes,
            "antiIce": "OFF",
            "approachFlapsDeg": 15,
            "landingFlapsDeg": 35,
            "windKnots": [-10, 0, 10, 20, 30],
            "runwayGradientPercent": [-2, 0, 1, 2],
        },
        "reviewSummary": {
            "expectedTemperatureRows": expected_rows,
            "expectedWeightCells": expected_cells,
            "recognizedOCRWeightTokens": recognized_tokens,
            "unrecognizedWeightTokens": (
                max(0, expected_cells - recognized_tokens)
                if expected_cells is not None else None
            ),
            "rowsWithIncompleteOrExtraOCRWidth": incomplete_rows,
            "rowsWithTesseractModeDisagreement": disagreeing_rows,
            "tesseractModes": ["psm11", "psm12"],
            "renderDpi": 450,
            "verifiedWeightCells": 0,
            "allOCRValuesRequireVisualVerification": True,
        },
        "tables": tables,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("pdf", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument(
        "--altitudes",
        type=parse_altitudes,
        default=parse_altitudes("0,1000,2000,3000,4000,5000,6000"),
        help="comma-separated pressure altitudes in 1000-ft increments (default: 0-6000)",
    )
    args = parser.parse_args()
    artifact = build_review(args.pdf, args.altitudes)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(artifact, indent=2) + "\n", encoding="utf-8")
    rows = [row for table in artifact["tables"] for row in table["ocrRows"]]
    candidates = sum(row["weightCandidatesLb"] is not None for row in rows)
    cells = sum(row["recognizedWeightCount"] for row in rows)
    row_checks = sum(table["rowCountMatchesExpected"] is True
                     for table in artifact["tables"])
    print(
        f"Wrote {args.output}: {len(artifact['tables'])} tables, "
        f"{len(rows)} OCR rows ({row_checks}/{len(artifact['tables'])} expected-row "
        f"counts matched), {candidates} full-width candidate rows, "
        f"{cells} OCR tokens, "
        f"{artifact['reviewSummary']['rowsWithTesseractModeDisagreement']} PSM disagreements; "
        "all unverified."
    )


if __name__ == "__main__":
    main()
