#!/usr/bin/env python3
"""Extract review candidates from scanned C56X Flaps 35 landing-distance charts.

The generated files are OCR candidates, not approved operational data. Review
every cell against the supplied AFM before moving any values into runtime data.
"""
import argparse
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import glyphs
import read_pages


def parse_integer(text):
    cleaned = text.strip().replace(",", "").replace("−", "-").replace("—", "-").replace("–", "-")
    if not re.fullmatch(r"-?\d+", cleaned):
        return None
    return int(cleaned)


def read_panel(components, bounds, profile, panel_index):
    x0, y0, x1, y1 = bounds
    first_center_y = profile["rowFirstCenterY300Dpi"][panel_index // 2]
    row_step = profile["rowStep300Dpi"]
    tolerance_y = profile["rowYTolerance300Dpi"]
    centers = profile["cellCentersRelative300Dpi"]
    gap = profile["glyphWordGap300Dpi"]
    selected = [
        component
        for component in components
        if x0 <= component[0] < x1 and y0 <= component[1] < y1
    ]
    selected.sort(
        key=lambda component: component[1] + component[3] / 2
        - (2 if component[3] <= 4 else 0)
    )

    grouped_rows = []
    current_row = []
    row_center = None
    for component in selected:
        center_y = component[1] + component[3] / 2
        if component[3] <= 4:
            center_y -= 2
        if row_center is None or abs(center_y - row_center) <= tolerance_y + 4:
            current_row.append(component)
            row_center = center_y if row_center is None else (row_center + center_y) / 2
        else:
            grouped_rows.append((row_center, current_row))
            current_row = [component]
            row_center = center_y
    if current_row:
        grouped_rows.append((row_center, current_row))

    rows = {}
    for center_y, row_components in grouped_rows:
        row_index = round((center_y - first_center_y) / row_step)
        if row_index < 0 or abs(center_y - (first_center_y + row_index * row_step)) > tolerance_y:
            continue
        words = []
        current_word = None
        for component in sorted(row_components, key=lambda item: item[0]):
            character, distance = read_pages.classify(
                *component, profile["maxGlyphDistance"]
            )
            if (
                current_word is None
                or component[0] - current_word["right"] > gap
            ):
                if current_word is not None:
                    words.append(current_word)
                current_word = {
                    "text": character,
                    "left": component[0],
                    "right": component[0] + component[2],
                    "maxGlyphDistance": distance,
                }
            else:
                current_word["text"] += character
                current_word["right"] = component[0] + component[2]
                current_word["maxGlyphDistance"] = max(
                    current_word["maxGlyphDistance"], distance
                )
        if current_word is not None:
            words.append(current_word)

        cells = {}
        for word in words:
            center_x = (word["left"] + word["right"]) / 2 - x0
            column_index = min(
                range(len(centers)), key=lambda index: abs(centers[index] - center_x)
            )
            if abs(centers[column_index] - center_x) > profile["cellXTolerance300Dpi"]:
                continue
            cell = {
                "text": word["text"].strip(),
                "maxGlyphDistance": round(word["maxGlyphDistance"], 2),
            }
            previous = cells.get(column_index)
            if (
                previous is None
                or cell["maxGlyphDistance"] < previous["maxGlyphDistance"]
            ):
                cells[column_index] = cell

        valid_distances = sum(
            profile["distanceRangeFt"][0]
            <= (parse_integer(cells[index]["text"]) or 0)
            <= profile["distanceRangeFt"][1]
            for index in range(1, 6)
            if index in cells
        )
        temperature = parse_integer(cells[0]["text"]) if 0 in cells else None
        if valid_distances < 2 and not (
            temperature is not None and -40 <= temperature <= 60
        ):
            continue
        rows[row_index] = cells
    return rows


def create_candidate(pdf_path, profile):
    with glyphs.fitz.open(pdf_path) as document:
        page_count = len(document)
    if page_count != profile["pageCount"]:
        raise ValueError(
            f"PDF has {page_count} pages; profile expects {profile['pageCount']}"
        )

    by_altitude = {}
    review = []
    panel_count = 0
    high_glyph_distance_cells = 0
    for page_index in range(page_count):
        altitude = (page_index // 2) * profile["pageAltitudeStepFt"]
        if altitude > profile["maxAltitudeFt"]:
            continue
        weight_set = profile["pageWeights"][page_index % 2]
        gray = glyphs.render(pdf_path, page_index)
        mask, _, _ = glyphs.glyph_mask(gray)
        components = [
            part
            for component in glyphs.components(mask)
            for part in read_pages.split_wide(component)
        ]
        for panel_index, bounds in enumerate(profile["panelBoxes300Dpi"]):
            rows = read_panel(components, bounds, profile, panel_index)
            weight = weight_set[panel_index]
            weight_table = by_altitude.setdefault(altitude, {}).setdefault(weight, [])
            panel_count += 1
            if not rows:
                review.append(
                    f"page {page_index + 1}, altitude {altitude}, weight {weight}: no rows detected"
                )
                continue
            for row_index in range(max(rows) + 1):
                cells = rows.get(row_index, {})
                temp_token = cells.get(0)
                temperature = parse_integer(temp_token["text"]) if temp_token else None
                distances = []
                for column_index in range(1, 6):
                    token = cells.get(column_index)
                    value = parse_integer(token["text"]) if token else None
                    if value is not None and not (
                        profile["distanceRangeFt"][0]
                        <= value
                        <= profile["distanceRangeFt"][1]
                        and value % 10 == 0
                    ):
                        value = None
                    distances.append(value)
                row = {
                    "temp": temperature,
                    "distancesFt": distances,
                    "maxGlyphDistance": {
                        str(column): cells[column]["maxGlyphDistance"]
                        for column in cells
                    },
                }
                weight_table.append(row)
                for column_index, value in enumerate([temperature, *distances]):
                    token = cells.get(column_index)
                    glyph_distance = token["maxGlyphDistance"] if token else None
                    if value is None or glyph_distance is None:
                        review.append(
                            f"page {page_index + 1}, altitude {altitude}, weight {weight}, "
                            f"row {row_index}, column {column_index}: missing or invalid; "
                            f"text={token['text'] if token else ''!r}, "
                            f"glyph distance={glyph_distance}"
                        )
                    elif glyph_distance > profile["maxGlyphDistance"]:
                        high_glyph_distance_cells += 1
                if temperature is not None and weight_table:
                    prior = weight_table[-2] if len(weight_table) > 1 else None
                    if prior and prior["temp"] is not None and temperature <= prior["temp"]:
                        review.append(
                            f"page {page_index + 1}, altitude {altitude}, weight {weight}, "
                            f"row {row_index}: non-increasing temperature sequence"
                        )
    return by_altitude, review, panel_count, high_glyph_distance_cells


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("pdf")
    parser.add_argument("output", help="Output candidate JSON path")
    parser.add_argument("--profile", default="tools/afm-audit/profiles/landing-distance-f35.json")
    parser.add_argument("--max-glyph-distance", type=float, default=4.5)
    args = parser.parse_args()

    with open(args.profile, encoding="utf-8") as file:
        profile = json.load(file)
    if profile.get("format") != "landing-distance-f35":
        parser.error("Profile format must be 'landing-distance-f35'")
    gradient = profile["runwayGradientByFile"].get(os.path.basename(args.pdf))
    if gradient is None:
        parser.error(
            "PDF filename must identify the AFM runway-gradient table in the profile"
        )

    profile["maxGlyphDistance"] = args.max_glyph_distance
    tables, review, panel_count, high_glyph_distance_cells = create_candidate(
        args.pdf, profile
    )
    result = {
        "status": "GLYPH_CANDIDATE_NOT_VERIFIED",
        "sourcePdf": os.path.basename(args.pdf),
        "figure": {
            -2: "4-46",
            -1: "4-45",
            0: "4-44",
        }[gradient],
        "runwayGradientPercent": gradient,
        "configuration": {
            "landingFlapsDeg": 35,
            "antiIce": "on-or-off",
            "landingGear": "down",
            "speedbrakes": "extend-after-touchdown",
            "thrust": "idle",
        },
        "altitudeCoverageFt": sorted(tables),
        "panelCount": panel_count,
        "highGlyphDistanceCellCount": high_glyph_distance_cells,
        "tables": [
            {
                "altitudeFt": altitude,
                "weights": [
                    {"weight": weight, "data": rows}
                    for weight, rows in sorted(weights.items(), reverse=True)
                ],
            }
            for altitude, weights in sorted(tables.items())
        ],
        "reviewRequired": review,
    }
    with open(args.output, "w", encoding="utf-8", newline="\n") as file:
        json.dump(result, file, indent=2, ensure_ascii=False)
        file.write("\n")

    print(
        f"Wrote {panel_count} table candidates across "
        f"{len(tables)} altitudes to {args.output}"
    )
    print(
        f"Cells above the glyph review threshold: {high_glyph_distance_cells}; "
        "all extracted values still require visual verification."
    )
    print(f"Review items: {len(review)}")
    if review:
        sys.exit(2)


if __name__ == "__main__":
    main()
