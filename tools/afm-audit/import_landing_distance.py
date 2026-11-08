#!/usr/bin/env python3
"""Import C56X Flaps 35 landing-distance charts for OCR review.

The generated JavaScript is cross-checked across all three runway-gradient
figures and against the existing glyph candidates. It remains OCR-derived and
must be checked against the approved AFM before operational use.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
from collections import Counter
from itertools import product
from pathlib import Path

import fitz


FILES = {
    "LD f35_zero.pdf": (0, "4-44", "landing-distance-level.candidates.json"),
    "LD f35_1dn.pdf": (-1, "4-45", "landing-distance-1dn.candidates.json"),
    "LD f35_2dn.pdf": (-2, "4-46", "landing-distance-2dn.candidates.json"),
}
WIND_KNOTS = [-10, 0, 10, 20, 30]
PANEL_HEADER = re.compile(r"V\w*REF.*VAPP", re.IGNORECASE)


def ocr_page(page: fitz.Page) -> str:
    pixmap = page.get_pixmap(dpi=300, alpha=False)
    return subprocess.run(
        ["tesseract", "stdin", "stdout", "--psm", "4"],
        input=pixmap.tobytes("png"),
        capture_output=True,
        check=True,
        env={**os.environ, "OMP_THREAD_LIMIT": "1"},
    ).stdout.decode("utf-8", errors="replace")


def numbers_in_line(line: str) -> list[tuple[int, int, str]]:
    normalized = line.replace("—", "-").replace("–", "-").replace("−", "-").replace("~", "-")
    return [(match.start(), match.end(), match.group()) for match in re.finditer(r"-?\d+", normalized)]


def distance_options(value: int) -> list[int]:
    if 1000 <= value <= 15000 and value % 10 == 0:
        return [value]
    if value <= 15000:
        return []
    candidates = {
        int(value_text[:index] + value_text[index + 1:])
        for value_text in [str(value)]
        for index in range(len(value_text))
        if len(value_text[:index] + value_text[index + 1:]) == 4
    }
    return sorted(candidate for candidate in candidates if 1000 <= candidate <= 15000 and candidate % 10 == 0)


def parse_distance_row(
    line: str,
) -> tuple[
    tuple[int | None, list[list[int]]],
    tuple[int | None, list[list[int]]],
] | None:
    tokens = numbers_in_line(line)
    distance_tokens = [
        (start, end, distance_options(abs(int(token))))
        for start, end, token in tokens
        if abs(int(token)) >= 1000
    ]
    if len(distance_tokens) != 10:
        return None
    if any(not choices for _, _, choices in distance_tokens):
        return None
    distances = [choices for _, _, choices in distance_tokens]
    left_distances = distances[:5]
    right_distances = distances[5:]

    left_temp: int | None = None
    right_temp: int | None = None
    for start, _, token in tokens:
        value = int(token)
        if abs(value) > 60:
            continue
        prior_distances = sum(distance_start < start for distance_start, _, _ in distance_tokens)
        if prior_distances < 5:
            if left_temp is None:
                left_temp = value
        elif right_temp is None:
            right_temp = value
    return (left_temp, left_distances), (right_temp, right_distances)


def resolve_panel_rows(
    rows: list[tuple[int | None, list[list[int]]]],
    reference_rows: list[dict] | None = None,
) -> list[dict]:
    if not rows:
        raise ValueError("No complete OCR data rows found")
    candidates_per_row = []
    for row_index, (temperature, cell_options) in enumerate(rows):
        possible_rows = [
            list(values)
            for values in product(*cell_options)
            if all(values[index] >= values[index + 1] for index in range(4))
        ]
        if (
            0 < row_index < len(rows) - 1
            and any(len(options) > 1 for options in cell_options)
        ):
            previous_options = rows[row_index - 1][1]
            next_options = rows[row_index + 1][1]
            if all(len(options) == 1 for options in previous_options + next_options):
                previous = [options[0] for options in previous_options]
                following = [options[0] for options in next_options]
                possible_rows = [
                    values for values in possible_rows
                    if all(previous[index] < values[index] < following[index] for index in range(5))
                ]
        if reference_rows and any(len(options) > 1 for options in cell_options):
            reference = next(
                (
                    row for row in reference_rows
                    if temperature is not None and (
                        row["temp"] == temperature
                        or (row_index == 0 and row["temp"] == abs(temperature))
                    )
                ),
                None,
            )
            if reference is not None:
                reference_distances = reference["distancesFt"]
                possible_rows = [
                    values for values in possible_rows
                    if values == reference_distances
                ]
        if not possible_rows:
            raise ValueError(f"No valid wind sequence in OCR row {row_index}")
        candidates_per_row.append((temperature, possible_rows))

    states = {
        tuple(values): {(tuple(values),)}
        for values in candidates_per_row[0][1]
    }
    for row_index in range(1, len(candidates_per_row)):
        possible_rows = candidates_per_row[row_index][1]
        next_states: dict[tuple[int, ...], set[tuple[tuple[int, ...], ...]]] = {}
        for current in possible_rows:
            current_tuple = tuple(current)
            paths = set()
            for previous, previous_paths in states.items():
                if all(current[column] >= previous[column] for column in range(5)):
                    paths.update(path + (current_tuple,) for path in previous_paths)
            if paths:
                next_states[current_tuple] = paths
        if not next_states:
            raise ValueError(f"Could not reconcile OCR rows at row {row_index}")
        states = next_states

    paths = {path for state_paths in states.values() for path in state_paths}
    unique_paths = {tuple(tuple(row) for row in path) for path in paths}
    if len(unique_paths) > 1:
        raise ValueError("OCR contains ambiguous digit repairs")
    selected = next(iter(unique_paths))
    return [
        {
            "temp": rows[index][0],
            "distancesFt": list(distances),
            "ocrRepairOptions": [
                {
                    "windIndex": wind_index,
                    "options": options,
                    "selected": distances[wind_index],
                }
                for wind_index, options in enumerate(rows[index][1])
                if len(options) > 1
            ],
        }
        for index, distances in enumerate(selected)
    ]


def parse_page(
    text: str,
    reference_panels: list[list[dict]] | None = None,
) -> list[list[dict]]:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    headers = [i for i, line in enumerate(lines) if PANEL_HEADER.search(line)]
    if len(headers) != 3:
        raise ValueError(f"Expected 3 table headers; found {len(headers)}")

    panels: list[list[dict]] = []
    for panel_index, start in enumerate(headers):
        end = headers[panel_index + 1] if panel_index + 1 < len(headers) else len(lines)
        left_rows: list[tuple[int | None, list[list[int]]]] = []
        right_rows: list[tuple[int | None, list[list[int]]]] = []
        for line in lines[start + 1:end]:
            row = parse_distance_row(line)
            if row is None:
                continue
            left_rows.append(row[0])
            right_rows.append(row[1])
        left_reference = reference_panels[panel_index * 2] if reference_panels else None
        right_reference = reference_panels[panel_index * 2 + 1] if reference_panels else None
        panels.extend((
            resolve_panel_rows(left_rows, left_reference),
            resolve_panel_rows(right_rows, right_reference),
        ))
    return panels


def candidate_rows(path: Path) -> dict[tuple[int, int], list[dict]]:
    candidate = json.loads(path.read_text(encoding="utf-8"))
    return {
        (table["altitudeFt"], weight["weight"]): weight["data"]
        for table in candidate["tables"]
        for weight in table["weights"]
    }


def load_ocr_candidates(
    pdf_dir: Path,
    profile: dict,
    ocr_cache: dict[str, list[str]] | None = None,
    ocr_cache_alt: dict[str, list[str]] | None = None,
) -> dict[int, dict[tuple[int, int], dict[str, list[dict]]]]:
    result: dict[int, dict[tuple[int, int], dict[str, list[dict]]]] = {}
    for filename, (gradient, _, _) in FILES.items():
        pdf_path = pdf_dir / filename
        document = fitz.open(pdf_path) if ocr_cache is None else None
        page_count = len(document) if document is not None else len(ocr_cache[filename])
        if page_count != profile["pageCount"]:
            raise ValueError(f"{filename}: expected {profile['pageCount']} pages, found {page_count}")
        tables: dict[tuple[int, int], dict[str, list[dict]]] = {}
        result[gradient] = tables
        for page_index in range(page_count):
            altitude_ft = (page_index // 2) * profile["pageAltitudeStepFt"]
            if altitude_ft > profile["maxAltitudeFt"]:
                continue
            page_text = (
                ocr_cache[filename][page_index]
                if ocr_cache is not None
                else ocr_page(document[page_index])
            )
            alternate_panels = None
            if ocr_cache_alt is not None:
                try:
                    alternate_panels = parse_page(ocr_cache_alt[filename][page_index])
                except ValueError:
                    alternate_panels = None
                if alternate_panels is not None and len(alternate_panels) != 6:
                    alternate_panels = None
            panels = parse_page(page_text, alternate_panels)
            if len(panels) != 6:
                raise ValueError(f"{filename} page {page_index + 1}: expected 6 panels, found {len(panels)}")
            for panel_index, panel in enumerate(panels):
                weight_lb = profile["pageWeights"][page_index % 2][panel_index]
                key = (altitude_ft, weight_lb)
                tables[key] = {"psm4": panel}
                if alternate_panels is not None:
                    tables[key]["psm6"] = alternate_panels[panel_index]
    return result


def normalize_temperature_rows(
    panel_key: tuple[int, int],
    ocr_rows_by_gradient: dict[int, list[list[dict]]],
    glyph_hints: dict[tuple[int, int], list[dict]],
    audit: dict,
) -> list[int]:
    row_count = max(len(rows) for rows in ocr_rows_by_gradient.values())
    hints = glyph_hints.get(panel_key, [])
    observations: list[list[int]] = []
    for row_index in range(row_count):
        observed = [
            rows[row_index]["temp"]
            for rows in ocr_rows_by_gradient.values()
            if row_index < len(rows)
            and rows[row_index]["temp"] is not None
            and -55 <= rows[row_index]["temp"] <= 60
        ]
        observed_temperature = None
        if observed:
            frequencies = Counter(observed)
            top = frequencies.most_common()
            if len(top) > 1 and top[0][1] == top[1][1] and max(observed) - min(observed) > 5:
                raise ValueError(
                    f"Conflicting OCR temperatures for {panel_key}, row {row_index}: {observed}"
                )
            observed_temperature = top[0][0]
        hint_temp = None
        if (
            row_index < len(hints)
            and hints[row_index].get("temp") is not None
            and -55 <= hints[row_index]["temp"] <= 60
        ):
            hint_temp = hints[row_index]["temp"]
        if observed_temperature is not None:
            observations.append([observed_temperature])
        elif hint_temp is not None:
            observations.append([hint_temp])
        else:
            observations.append([])

    def row_cost(expected: int, values: list[int], is_last: bool) -> int:
        if not values:
            return 0
        if is_last and expected - 4 <= values[0] <= expected:
            return 0
        return sum(abs(value - expected) for value in values)

    starts = range(-40, 21, 5)
    ranked = []
    for start in starts:
        expected = [start + index * 5 for index in range(row_count)]
        score = sum(
            row_cost(value, observations[index], index == row_count - 1)
            for index, value in enumerate(expected)
        )
        ranked.append((score, start, expected))
    ranked.sort(key=lambda result: (result[0], result[1]))
    if not observations or not any(observations):
        raise ValueError(f"No usable temperature reading for {panel_key}")
    best_score, start, temperatures = ranked[0]
    equally_good = [entry for entry in ranked if entry[0] == best_score]
    if len(equally_good) > 1:
        raise ValueError(f"Ambiguous temperature sequence for {panel_key}: {equal_good[:4]}")

    last_observed = observations[-1]
    previous = temperatures[-2] if row_count > 1 else None
    if last_observed and previous is not None:
        valid_last = [
            value for value in last_observed
            if previous < value <= previous + 5 and -55 <= value <= 60
        ]
        if valid_last:
            temperatures[-1] = sorted(valid_last)[len(valid_last) // 2]
    if any(not -55 <= value <= 60 for value in temperatures):
        raise ValueError(f"Temperature out of range for {panel_key}: {temperatures}")

    for row_index, values in enumerate(observations):
        if values and any(value != temperatures[row_index] for value in values):
            audit["temperatureCorrections"].append({
                "altitudeFt": panel_key[0],
                "weightLb": panel_key[1],
                "row": row_index,
                "ocrValues": values,
                "resolvedTemperature": temperatures[row_index],
            })
    if any(temperatures[index] <= temperatures[index - 1] for index in range(1, row_count)):
        raise ValueError(f"Non-increasing temperatures for {panel_key}: {temperatures}")
    if start < -40 or start > 20:
        raise ValueError(f"Unreasonable first temperature for {panel_key}: {temperatures}")
    return temperatures


def build_runtime_tables(
    pdf_dir: Path,
    profile_path: Path,
    review_dir: Path,
    ocr_cache_path: Path | None = None,
    ocr_cache_alt_path: Path | None = None,
) -> tuple[dict[int, list[dict]], dict]:
    profile = json.loads(profile_path.read_text(encoding="utf-8"))
    ocr_cache = (
        json.loads(ocr_cache_path.read_text(encoding="utf-8"))
        if ocr_cache_path is not None
        else None
    )
    ocr_cache_alt = (
        json.loads(ocr_cache_alt_path.read_text(encoding="utf-8"))
        if ocr_cache_alt_path is not None
        else None
    )
    ocr_by_gradient = load_ocr_candidates(pdf_dir, profile, ocr_cache, ocr_cache_alt)
    expected_keys = set(next(iter(ocr_by_gradient.values())))
    for gradient, tables in ocr_by_gradient.items():
        if set(tables) != expected_keys:
            raise ValueError(f"Gradient {gradient}: panel coverage differs from other figures")

    glyph_hints = {}
    for filename, (gradient, _, candidate_name) in FILES.items():
        glyph_hints[gradient] = candidate_rows(review_dir / candidate_name)

    output: dict[int, list[dict]] = {}
    audit = {
        "status": "OCR_CROSS_CHECKED_NOT_VISUALLY_CERTIFIED",
        "sources": [
            {"file": filename, "figure": figure, "runwayGradientPercent": gradient}
            for filename, (gradient, figure, _) in FILES.items()
        ],
        "altitudesFt": sorted({altitude for altitude, _ in expected_keys}),
        "panels": [],
        "candidateDifferences": [],
        "temperatureCorrections": [],
        "ocrDigitRepairs": [],
        "segmentationChoices": [],
        "checks": {
            "consistentPanelCoverage": True,
            "temperatureRowsCrossCheckedAcrossThreeFigures": True,
            "allCellsHaveTenFootResolution": True,
            "headwindReducesDistance": True,
            "downhillDistanceNotLessThanLevel": True,
        },
    }

    for altitude_ft, weight_lb in sorted(expected_keys):
        key = (altitude_ft, weight_lb)
        options = {
            (gradient, segmentation): rows
            for gradient, tables in ocr_by_gradient.items()
            for segmentation, rows in tables[key].items()
        }
        counts = {}
        for rows in options.values():
            counts[len(rows)] = counts.get(len(rows), 0) + 1
        best_count = max(counts.values())
        common_counts = [count for count, occurrences in counts.items() if occurrences == best_count]
        if len(common_counts) != 1:
            psm4_counts = [
                len(tables[key]["psm4"])
                for tables in ocr_by_gradient.values()
            ]
            psm4_count = max(set(psm4_counts), key=psm4_counts.count)
            if psm4_count not in common_counts:
                raise ValueError(f"Ambiguous OCR row count for {key}: {counts}")
            expected_row_count = psm4_count
        else:
            expected_row_count = common_counts[0]
        rows_by_gradient = {}
        for gradient, tables in ocr_by_gradient.items():
            available = [
                (segmentation, rows)
                for segmentation, rows in tables[key].items()
                if len(rows) == expected_row_count
            ]
            if not available:
                raise ValueError(f"No OCR segmentation matches common row count for {key}/{gradient}")
            segmentation, rows = next(
                ((name, values) for name, values in available if name == "psm4"),
                available[0],
            )
            rows_by_gradient[gradient] = rows
            audit["segmentationChoices"].append({
                "altitudeFt": altitude_ft,
                "weightLb": weight_lb,
                "runwayGradientPercent": gradient,
                "selected": segmentation,
                "rowCount": len(rows),
            })
        row_counts = {gradient: len(rows) for gradient, rows in rows_by_gradient.items()}
        if len(set(row_counts.values())) != 1:
            raise ValueError(f"Row count mismatch for {key}: {row_counts}")
        temperatures = normalize_temperature_rows(key, rows_by_gradient, glyph_hints[0], audit)
        row_count = len(temperatures)

        weights_by_gradient = {}
        for gradient, rows in rows_by_gradient.items():
            hints = glyph_hints[gradient].get(key, [])
            normalized_rows = []
            for row_index, row in enumerate(rows):
                distances = row["distancesFt"]
                if len(distances) != 5 or any(value < 1000 or value > 15000 for value in distances):
                    raise ValueError(f"Invalid distance row for {gradient}/{key}/{row_index}: {distances}")
                if any(distances[i] <= distances[i + 1] for i in range(4)):
                    audit["checks"]["headwindReducesDistance"] = False
                    raise ValueError(f"Wind sequence is not strictly decreasing for {gradient}/{key}/{row_index}")
                if any(value % 10 for value in distances):
                    audit["checks"]["allCellsHaveTenFootResolution"] = False
                    raise ValueError(f"Distance is not rounded to ten feet for {gradient}/{key}/{row_index}")
                if row["ocrRepairOptions"]:
                    audit["ocrDigitRepairs"].append({
                        "runwayGradientPercent": gradient,
                        "altitudeFt": altitude_ft,
                        "weightLb": weight_lb,
                        "row": row_index,
                        "temp": temperatures[row_index],
                        "cells": row["ocrRepairOptions"],
                    })
                if row_index < len(hints):
                    hint_row = hints[row_index]
                    if hint_row.get("temp") is not None and abs(hint_row["temp"] - temperatures[row_index]) > 5:
                        audit["candidateDifferences"].append({
                            "figure": FILES[next(name for name, value in FILES.items() if value[0] == gradient)][1],
                            "altitudeFt": altitude_ft,
                            "weightLb": weight_lb,
                            "row": row_index,
                            "kind": "temperature",
                            "candidate": hint_row["temp"],
                            "ocrConsensus": temperatures[row_index],
                        })
                    for wind_index, value in enumerate(distances):
                        hint_values = hint_row.get("distancesFt", [])
                        if wind_index < len(hint_values) and hint_values[wind_index] is not None and hint_values[wind_index] != value:
                            audit["candidateDifferences"].append({
                                "figure": FILES[next(name for name, value in FILES.items() if value[0] == gradient)][1],
                                "altitudeFt": altitude_ft,
                                "weightLb": weight_lb,
                                "row": row_index,
                                "windKnots": WIND_KNOTS[wind_index],
                                "kind": "distance",
                                "candidate": hint_values[wind_index],
                                "ocr": value,
                            })
                normalized_rows.append({
                    "temp": temperatures[row_index],
                    "distancesFt": distances,
                })
            weights_by_gradient[gradient] = normalized_rows
            audit["panels"].append({
                "runwayGradientPercent": gradient,
                "altitudeFt": altitude_ft,
                "weightLb": weight_lb,
                "rowCount": row_count,
                "cellCount": row_count * 6,
            })

        level_rows = weights_by_gradient[0]
        for gradient in (-1, -2):
            for row_index, (level, downhill) in enumerate(zip(level_rows, weights_by_gradient[gradient])):
                if any(downhill["distancesFt"][i] < level["distancesFt"][i] for i in range(5)):
                    audit["checks"]["downhillDistanceNotLessThanLevel"] = False
        for gradient, rows in weights_by_gradient.items():
            altitude_entry = next(
                (entry for entry in output.setdefault(gradient, []) if entry["altitudeFt"] == altitude_ft),
                None,
            )
            if altitude_entry is None:
                altitude_entry = {"altitudeFt": altitude_ft, "weights": []}
                output[gradient].append(altitude_entry)
            altitude_entry["weights"].append({
                "weight": weight_lb,
                "data": [
                    {
                        "temp": row["temp"],
                        "tailwind10": row["distancesFt"][0],
                        "zeroWind": row["distancesFt"][1],
                        "headwind10": row["distancesFt"][2],
                        "headwind20": row["distancesFt"][3],
                        "headwind30": row["distancesFt"][4],
                    }
                    for row in rows
                ],
            })

    if not audit["checks"]["downhillDistanceNotLessThanLevel"]:
        raise ValueError("A downhill table contains a distance lower than the level table")
    for gradient in output:
        for altitude in output[gradient]:
            altitude["weights"].sort(key=lambda entry: entry["weight"], reverse=True)
        output[gradient].sort(key=lambda entry: entry["altitudeFt"])
    return output, audit


def write_javascript(tables: dict[int, list[dict]], output_path: Path) -> None:
    names = {
        0: ("landingDistanceFlaps35_zeroGradient", "Figure 4-44"),
        -1: ("landingDistanceFlaps35_down1Percent", "Figure 4-45"),
        -2: ("landingDistanceFlaps35_down2Percent", "Figure 4-46"),
    }
    chunks = [
        "// OCR-cross-checked AFM data; visually verify against the approved AFM before operational use."
    ]
    for gradient in (0, -1, -2):
        name, figure = names[gradient]
        chunks.append(f"// {figure}; runway gradient {gradient}%")
        chunks.append(f"const {name} = {json.dumps(tables[gradient], indent=2)};")
    output_path.write_text("\n\n".join(chunks) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--pdf-dir", type=Path, required=True)
    parser.add_argument(
        "--profile",
        type=Path,
        default=Path("tools/afm-audit/profiles/landing-distance-f35.json"),
    )
    parser.add_argument(
        "--review-dir",
        type=Path,
        default=Path("tools/afm-audit/review"),
    )
    parser.add_argument(
        "--js-output",
        type=Path,
        default=Path("data/c56x/landing-distance-flaps35.js"),
    )
    parser.add_argument(
        "--audit-output",
        type=Path,
        default=Path("tools/afm-audit/review/landing-distance-import-audit.json"),
    )
    parser.add_argument(
        "--ocr-cache",
        type=Path,
        help="Reuse a JSON map of PDF filenames to per-page OCR text.",
    )
    parser.add_argument(
        "--ocr-cache-alt",
        type=Path,
        help="Optional alternate-segmentation OCR cache (PSM 6) for recovery.",
    )
    args = parser.parse_args()

    tables, audit = build_runtime_tables(
        args.pdf_dir,
        args.profile,
        args.review_dir,
        args.ocr_cache,
        args.ocr_cache_alt,
    )
    args.js_output.parent.mkdir(parents=True, exist_ok=True)
    args.audit_output.parent.mkdir(parents=True, exist_ok=True)
    write_javascript(tables, args.js_output)
    args.audit_output.write_text(json.dumps(audit, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {args.js_output}")
    print(f"Wrote {args.audit_output}")
    print(f"Panels: {len(audit['panels'])}; candidate differences: {len(audit['candidateDifferences'])}")


if __name__ == "__main__":
    main()
