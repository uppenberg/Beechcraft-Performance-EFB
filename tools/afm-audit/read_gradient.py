#!/usr/bin/env python3
"""Read scanned second-segment climb-gradient tables using the AFM audit profile.

The OCR is a screening/extraction aid; review the emitted .todo file and compare
the results visually with the source AFM before using the generated data.
"""
import argparse
import io
import json
import math
import os
import re
import subprocess
import sys

import fitz
from PIL import Image


def parse_value(text, value_range):
    values = re.findall(r"-?(?:\d+(?:\.\d+)?|\.\d+)", text)
    if len(values) != 1:
        return None
    cleaned = values[0]
    if not cleaned:
        return None

    if cleaned.count(".") > 1:
        return None
    if "." in cleaned:
        if len(cleaned.split(".")[1]) != 1:
            return None
        try:
            value = float(cleaned)
            return value if value_range[0] <= value <= value_range[1] else None
        except ValueError:
            return None

    sign = -1 if cleaned.startswith("-") else 1
    digits = cleaned.lstrip("-")
    if len(digits) not in (2, 3):
        return None
    value = sign * float(digits[:-1] + "." + digits[-1])
    return value if value_range[0] <= value <= value_range[1] else None


def ocr_band(image, band_top, profile, page_number, altitude, weight_index, page_offset):
    anchors = profile["xCenters600Dpi"]
    x_start = (
        anchors[weight_index * 5]
        + page_offset
        - profile["weightPanelLeftPadding600Dpi"]
    )
    band = image.crop((
        x_start,
        band_top,
        x_start + profile["weightPanelWidth600Dpi"],
        band_top + profile["bandHeight600Dpi"],
    ))
    buffer = io.BytesIO()
    band.save(buffer, format="PNG")

    env = os.environ.copy()
    env["OMP_THREAD_LIMIT"] = "1"
    result = subprocess.run(
        ["tesseract", "stdin", "stdout", "--psm", "6", "tsv"],
        input=buffer.getvalue(),
        capture_output=True,
        check=False,
        env=env,
    )
    if result.returncode:
        raise RuntimeError(
            f"Tesseract failed on PDF page {page_number}: "
            f"{result.stderr.decode(errors='replace').strip()}"
        )
    return result.stdout.decode("utf-8", errors="replace")


def temperatures_for_altitude(profile, altitude):
    temperatures_by_altitude = profile.get("temperaturesByAltitude")
    if temperatures_by_altitude is None:
        return profile["temperatures"]
    try:
        return temperatures_by_altitude[str(altitude)]
    except KeyError as error:
        raise ValueError(f"Profile has no temperature grid for {altitude} ft") from error


def altitude_row_offset(profile, altitude):
    if "temperaturesByAltitude" not in profile:
        return (
            (altitude - profile["_pageBaseAltitude"])
            * profile["_altitudeBandStep600Dpi"]
            // profile["altitudeStepFt"]
        )

    offset_rows = 0
    for previous_altitude in range(
        profile["_pageBaseAltitude"], altitude, profile["altitudeStepFt"]
    ):
        offset_rows += len(temperatures_for_altitude(profile, previous_altitude))
    return offset_rows * profile["rowStep600Dpi"]


def extract_rows(tsv, profile, x_offset, band_top, altitude, weight_index, page_offset):
    anchors = [
        center + page_offset
        for center in profile["xCenters600Dpi"][weight_index * 5 : weight_index * 5 + 5]
    ]
    tolerance = profile.get("cellXTolerance600Dpi", 70)
    temperatures = temperatures_for_altitude(profile, altitude)
    row_count = len(temperatures)
    row_step = profile["rowStep600Dpi"]
    first_row_y = profile["firstRowY600Dpi"] + altitude_row_offset(profile, altitude)
    cells_by_row = [[None] * 5 for _ in range(row_count)]
    for line in tsv.splitlines()[1:]:
        fields = line.split("\t")
        if len(fields) < 12:
            continue
        try:
            x, y, width, height, confidence = (
                int(fields[6]), int(fields[7]), int(fields[8]),
                int(fields[9]), float(fields[10])
            )
        except ValueError:
            continue
        if confidence < 0:
            continue
        center_x = x_offset + x + width / 2
        center_y = band_top + y + height / 2
        column = min(range(5), key=lambda index: abs(anchors[index] - center_x))
        if abs(anchors[column] - center_x) > tolerance:
            continue
        row = round((center_y - first_row_y) / row_step)
        if row < 0 or row >= row_count:
            continue
        expected_y = first_row_y + row * row_step
        if abs(center_y - expected_y) > profile.get("rowYTolerance600Dpi", 26):
            continue
        token = {
            "confidence": confidence,
            "text": fields[11].strip(),
        }
        previous = cells_by_row[row][column]
        if previous is None or token["confidence"] > previous["confidence"]:
            cells_by_row[row][column] = token
    return cells_by_row


def format_table(altitudes):
    """JS literal with one line per temperature row, matching the hand-maintained data files."""
    lines = ["["]
    for a_index, altitude in enumerate(altitudes):
        lines += ["  {", f"    altitudeFt: {altitude['altitudeFt']},", "    weights: ["]
        for w_index, weight in enumerate(altitude["weights"]):
            lines += ["      {", f"        weight: {weight['weight']},", "        data: ["]
            for r_index, row in enumerate(weight["data"]):
                winds = ", ".join(
                    f'"{wind}": {row["windKnots"][wind]}'
                    for wind in ("0", "10", "20", "30", "-10")
                    if wind in row["windKnots"]
                )
                comma = "," if r_index < len(weight["data"]) - 1 else ""
                lines.append(f"          {{ temp: {row['temp']}, windKnots: {{ {winds} }} }}{comma}")
            lines += ["        ]", "      }" + ("," if w_index < len(altitude["weights"]) - 1 else "")]
        lines += ["    ]", "  }" + ("," if a_index < len(altitudes) - 1 else "")]
    lines.append("]")
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("pdf")
    parser.add_argument("output", help="Output JavaScript file path")
    parser.add_argument("--profile", required=True, help="Climb-gradient JSON profile")
    parser.add_argument("--const", required=True, dest="const_name", help="JavaScript const name")
    parser.add_argument("--max-altitude", type=int, default=6000)
    parser.add_argument("--min-confidence", type=float, default=60)
    parser.add_argument(
        "--corrections",
        help="JSON object of manually reviewed cells keyed as altitude/weight/temp/wind",
    )
    args = parser.parse_args()

    if not re.fullmatch(r"[A-Za-z_$][A-Za-z0-9_$]*", args.const_name):
        parser.error("--const must be a valid JavaScript identifier")

    with open(args.profile, encoding="utf-8") as file:
        profile = json.load(file)
    if profile.get("format") != "climb-gradient":
        parser.error("The profile format must be 'climb-gradient'")
    if not profile.get("temperatures") and not profile.get("temperaturesByAltitude"):
        parser.error("The profile must provide temperatures or temperaturesByAltitude")

    document = fitz.open(args.pdf)
    if len(document) != len(profile["pageAltitudes"]):
        parser.error(
            f"PDF has {len(document)} pages, profile expects "
            f"{len(profile['pageAltitudes'])}"
        )
    page_altitude_counts = profile.get(
        "pageAltitudeCounts",
        [profile["altitudesPerPage"]] * len(profile["pageAltitudes"]),
    )
    if len(page_altitude_counts) != len(profile["pageAltitudes"]):
        parser.error("The profile must provide one pageAltitudeCounts entry per page")
    if len(profile["xCenters600Dpi"]) != len(profile["pageWeights"][0]) * 5:
        parser.error("The profile must provide five wind-column centers per weight")
    if len(profile.get("pageXOffsets600Dpi", [])) != len(profile["pageAltitudes"]):
        parser.error("The profile must provide one pageXOffsets600Dpi entry per page")
    if len(profile.get("valueRange", [])) != 2:
        parser.error("The profile must provide a two-item valueRange")

    corrections = {}
    if args.corrections:
        with open(args.corrections, encoding="utf-8") as file:
            corrections = json.load(file)
        if not isinstance(corrections, dict):
            parser.error("--corrections must contain a JSON object")
        for key, value in corrections.items():
            if (
                not isinstance(key, str)
                or not isinstance(value, (int, float))
                or isinstance(value, bool)
                or not math.isfinite(value)
                or not profile["valueRange"][0] <= value <= profile["valueRange"][1]
            ):
                parser.error(f"Invalid correction {key!r}: {value!r}")

    applied_corrections = set()
    tables = {}
    review = []
    for page_index, page in enumerate(document):
        base_altitude = profile["pageAltitudes"][page_index]
        if base_altitude > args.max_altitude:
            continue
        weights = profile["pageWeights"][page_index % len(profile["pageWeights"])]
        page_offset = profile["pageXOffsets600Dpi"][page_index]
        pixmap = page.get_pixmap(dpi=600, alpha=False)
        image = Image.frombytes("RGB", (pixmap.width, pixmap.height), pixmap.samples)
        for altitude_index in range(page_altitude_counts[page_index]):
            altitude = base_altitude + altitude_index * profile["altitudeStepFt"]
            if altitude > args.max_altitude:
                break
            band_profile = dict(
                profile,
                _pageBaseAltitude=base_altitude,
                _altitudeBandStep600Dpi=profile.get("altitudeBandStep600Dpi", 0),
            )
            band_top = (
                profile["firstRowY600Dpi"]
                + altitude_row_offset(band_profile, altitude)
                - profile["bandTopOffset600Dpi"]
            )
            for weight_index, weight in enumerate(weights):
                tsv = ocr_band(
                    image,
                    band_top,
                    band_profile,
                    page_index + 1,
                    altitude,
                    weight_index,
                    page_offset,
                )
                extracted = extract_rows(
                    tsv,
                    band_profile,
                    profile["xCenters600Dpi"][weight_index * 5]
                    + page_offset
                    - profile["weightPanelLeftPadding600Dpi"],
                    band_top,
                    altitude,
                    weight_index,
                    page_offset,
                )
                for temperature_index, cells in enumerate(extracted):
                    temperature = temperatures_for_altitude(
                        profile, altitude
                    )[temperature_index]
                    weight_table = tables.setdefault(altitude, {}).setdefault(weight, {})
                    wind_values = {}
                    for wind_index, wind in enumerate((-10, 0, 10, 20, 30)):
                        token = cells[wind_index]
                        correction_key = f"{altitude}/{weight}/{temperature}/{wind}"
                        has_correction = correction_key in corrections
                        value = (
                            corrections[correction_key]
                            if has_correction
                            else parse_value(token["text"], profile["valueRange"]) if token else None
                        )
                        if has_correction:
                            applied_corrections.add(correction_key)
                        elif token is None or value is None or token["confidence"] < args.min_confidence:
                            reason = "missing" if token is None else (
                                "unparsed" if value is None else "low confidence"
                            )
                            confidence = f", confidence {token['confidence']:.1f}" if token else ""
                            review.append(
                                f"page {page_index + 1}, altitude {altitude}, "
                                f"weight {weight}, temp {temperature}, wind {wind}: "
                                f"{reason} ({token['text'] if token else ''}{confidence})"
                            )
                        if value is not None:
                            wind_values[str(wind)] = value
                    present_values = [
                        wind_values.get(str(wind)) for wind in (-10, 0, 10, 20, 30)
                    ]
                    if all(value is not None for value in present_values) and any(
                        upper < lower
                        for lower, upper in zip(present_values, present_values[1:])
                    ):
                        review.append(
                            f"page {page_index + 1}, altitude {altitude}, "
                            f"weight {weight}, temp {temperature}: non-monotonic "
                            f"wind values {present_values}"
                        )
                    weight_table[temperature] = wind_values

    unused_corrections = set(corrections) - applied_corrections
    if unused_corrections:
        parser.error(
            "Corrections did not match extracted cells: "
            + ", ".join(sorted(unused_corrections))
        )

    altitudes = []
    for altitude in sorted(tables):
        weights = []
        for weight in sorted(tables[altitude], reverse=True):
            temperatures = []
            for temp in temperatures_for_altitude(profile, altitude):
                values = tables[altitude][weight].get(temp, {})
                temperatures.append({"temp": temp, "windKnots": values})
            weights.append({"weight": weight, "data": temperatures})
        altitudes.append({"altitudeFt": altitude, "weights": weights})

    output = ""
    if profile.get("candidateOnly"):
        output += "// OCR_CANDIDATE_NOT_VISUALLY_CERTIFIED; do not use operationally.\n"
    output += "const " + args.const_name + " = " + format_table(altitudes) + ";\n"
    with open(args.output, "w", encoding="utf-8", newline="\n") as file:
        file.write(output)
    with open(args.output + ".json", "w", encoding="utf-8", newline="\n") as file:
        json.dump(altitudes, file, indent=2, ensure_ascii=False)
    todo_path = args.output + ".todo"
    with open(todo_path, "w", encoding="utf-8", newline="\n") as file:
        file.write("\n".join(review) + ("\n" if review else ""))
    print(f"Wrote {len(altitudes)} altitudes to {args.output}")
    print(f"Values requiring review: {len(review)} ({todo_path})")
    if review:
        sys.exit(2)


if __name__ == "__main__":
    main()
