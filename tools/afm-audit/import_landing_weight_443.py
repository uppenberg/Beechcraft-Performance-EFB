#!/usr/bin/env python3
"""Import dual-OCR Figure 4-43 candidates into an audited JavaScript data file."""

from __future__ import annotations

import argparse
import json
from pathlib import Path


MIN_WEIGHT_LB = 13000
MAX_WEIGHT_LB = 18700


def validate_ordering(tables: list[dict], column_order: list[dict]) -> dict[str, bool]:
    checks = {
        "weightDoesNotDecreaseWithRunwayGradient": True,
        "weightDoesNotDecreaseWithHeadwind": True,
        "weightDoesNotIncreaseWithTemperature": True,
        "weightDoesNotIncreaseWithPressureAltitude": True,
    }
    gradients = sorted({column["runwayGradientPercent"] for column in column_order})
    winds = sorted({column["windKnots"] for column in column_order})

    for table in tables:
        rows = table["rows"]
        for row_index, row in enumerate(rows):
            weights = row["maximumLandingWeightLbByColumn"]
            for wind in winds:
                sequence = [
                    weights[index]
                    for index, column in enumerate(column_order)
                    if column["windKnots"] == wind
                ]
                if any(first > second for first, second in zip(sequence, sequence[1:])):
                    checks["weightDoesNotDecreaseWithRunwayGradient"] = False
                    raise ValueError(
                        f"Runway-gradient ordering failed at {table['altitudeFt']} ft, "
                        f"{row['temperatureC']} C, {wind} kt"
                    )
            for gradient in gradients:
                sequence = [
                    weights[index]
                    for index, column in enumerate(column_order)
                    if column["runwayGradientPercent"] == gradient
                ]
                if any(first > second for first, second in zip(sequence, sequence[1:])):
                    checks["weightDoesNotDecreaseWithHeadwind"] = False
                    raise ValueError(
                        f"Wind ordering failed at {table['altitudeFt']} ft, "
                        f"{row['temperatureC']} C, {gradient}%"
                    )
            if row_index:
                previous = rows[row_index - 1]["maximumLandingWeightLbByColumn"]
                if any(previous_value < value for previous_value, value in zip(previous, weights)):
                    checks["weightDoesNotIncreaseWithTemperature"] = False
                    raise ValueError(
                        f"Temperature ordering failed at {table['altitudeFt']} ft, "
                        f"{row['temperatureC']} C"
                    )

    for lower, higher in zip(tables, tables[1:]):
        higher_rows = {
            row["temperatureC"]: row["maximumLandingWeightLbByColumn"]
            for row in higher["rows"]
        }
        for row in lower["rows"]:
            higher_weights = higher_rows.get(row["temperatureC"])
            if higher_weights is not None and any(
                higher_weight > lower_weight
                for higher_weight, lower_weight in zip(
                    higher_weights, row["maximumLandingWeightLbByColumn"]
                )
            ):
                checks["weightDoesNotIncreaseWithPressureAltitude"] = False
                raise ValueError(
                    f"Altitude ordering failed between {lower['altitudeFt']} and "
                    f"{higher['altitudeFt']} ft at {row['temperatureC']} C"
                )
    return checks


def build_candidate(candidate_path: Path, profile_path: Path) -> dict:
    candidate = json.loads(candidate_path.read_text(encoding="utf-8"))
    profile = json.loads(profile_path.read_text(encoding="utf-8"))
    coverage = profile["coverage"]
    expected_altitudes = coverage["altitudesFt"]
    if len(profile["weightColumnOrder"]) != profile["weightsPerTemperatureRow"]:
        raise ValueError("Profile weight-column map has an invalid width")
    if candidate.get("artifactType") != "AFM OCR candidates; not runtime data":
        raise ValueError("Input is not a Figure 4-43 OCR candidate artifact")
    if candidate.get("coverage", {}).get("altitudesFt") != expected_altitudes:
        raise ValueError("Candidate altitude coverage does not match the profile")
    if candidate.get("reviewSummary", {}).get("rowsWithTesseractModeDisagreement") != 0:
        raise ValueError("Tesseract PSM 11 and 12 disagree; resolve OCR rows before export")

    tables_by_altitude = {
        table["altitudeFt"]: table
        for table in candidate.get("tables", [])
    }
    if set(tables_by_altitude) != set(expected_altitudes):
        raise ValueError("Candidate does not contain exactly the profiled altitude tables")

    applied_corrections = []
    unapplied_correction_keys = {
        (
            correction["altitudeFt"],
            correction["temperatureC"],
            correction["windKnots"],
            correction["runwayGradientPercent"],
        )
        for correction in profile.get("manualCorrections", [])
    }
    imported_tables = []
    imported_cells = 0
    for altitude in expected_altitudes:
        table = tables_by_altitude[altitude]
        temperatures = profile["temperatureRowsC"][str(altitude)]
        if table.get("rowCountMatchesExpected") is not True:
            raise ValueError(f"{altitude} ft: OCR row count does not match the expected grid")
        rows = table.get("ocrRows", [])
        if len(rows) != len(temperatures):
            raise ValueError(f"{altitude} ft: temperature-row count mismatch")

        imported_rows = []
        for row_index, (temperature, row) in enumerate(zip(temperatures, rows)):
            tokens = row.get("recognizedWeightTokens", [])
            alternate_tokens = row.get("alternateRecognizedWeightTokens", [])
            if not row.get("ocrModesAgree") or tokens != alternate_tokens:
                raise ValueError(f"{altitude} ft row {row_index}: OCR modes disagree")
            if len(tokens) != profile["weightsPerTemperatureRow"]:
                raise ValueError(f"{altitude} ft row {row_index}: expected 20 weight values")
            weights = [int(token) for token in tokens]
            for column_index, column in enumerate(profile["weightColumnOrder"]):
                correction_key = (
                    altitude,
                    temperature,
                    column["windKnots"],
                    column["runwayGradientPercent"],
                )
                correction = next(
                    (
                        item
                        for item in profile.get("manualCorrections", [])
                        if (
                            item["altitudeFt"],
                            item["temperatureC"],
                            item["windKnots"],
                            item["runwayGradientPercent"],
                        ) == correction_key
                    ),
                    None,
                )
                if correction is not None:
                    if weights[column_index] != correction["ocrValueLb"]:
                        raise ValueError(
                            f"Correction expected OCR value {correction['ocrValueLb']} "
                            f"at {correction_key}, found {weights[column_index]}"
                        )
                    weights[column_index] = correction["correctedValueLb"]
                    unapplied_correction_keys.remove(correction_key)
                    applied_corrections.append(correction)
            if any(
                weight < MIN_WEIGHT_LB
                or weight > MAX_WEIGHT_LB
                or weight % 10
                for weight in weights
            ):
                raise ValueError(
                    f"{altitude} ft row {row_index}: invalid AFM weight candidates {weights}"
                )
            imported_rows.append({
                "temperatureC": temperature,
                "maximumLandingWeightLbByColumn": weights,
            })
            imported_cells += len(weights)

        imported_tables.append({
            "altitudeFt": altitude,
            "rows": imported_rows,
        })

    if unapplied_correction_keys:
        raise ValueError(f"Unmatched manual correction keys: {sorted(unapplied_correction_keys)}")

    ordering_checks = validate_ordering(
        imported_tables,
        profile["weightColumnOrder"],
    )
    return {
        "status": "OCR_CROSS_CHECKED_NOT_VISUALLY_CERTIFIED",
        "sourcePdf": Path(candidate["sourcePdf"]).name,
        "figure": candidate["figure"],
        "configuration": {
            "antiIce": coverage["antiIce"],
            "approachFlapsDeg": coverage["approachFlapsDeg"],
            "landingFlapsDeg": coverage["landingFlapsDeg"],
        },
        "weightColumns": profile["weightColumnOrder"],
        "altitudeTables": imported_tables,
        "audit": {
            "renderDpi": candidate["reviewSummary"]["renderDpi"],
            "tesseractModes": candidate["reviewSummary"]["tesseractModes"],
            "ocrWeightCellsCrossChecked": imported_cells,
            "visuallyVerifiedWeightCells": len(applied_corrections),
            "manualCorrections": applied_corrections,
            "orderingChecks": ordering_checks,
            "runtimeReady": False,
        },
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("candidate", type=Path)
    parser.add_argument(
        "output",
        type=Path,
        help="JavaScript output path (data remains marked not visually certified).",
    )
    parser.add_argument(
        "--profile",
        type=Path,
        default=Path("tools/afm-audit/profiles/landing-weight-443.json"),
    )
    args = parser.parse_args()

    data = build_candidate(args.candidate, args.profile)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    js = (
        "// OCR-cross-checked AFM data; not visually certified. Verify before operational use.\n"
        "const c56xFigure443LandingWeight = "
        + json.dumps(data, indent=2)
        + ";\n"
    )
    args.output.write_text(js, encoding="utf-8")
    print(
        f"Wrote {args.output}: {len(data['altitudeTables'])} altitudes, "
        f"{data['audit']['ocrWeightCellsCrossChecked']} OCR-cross-checked cells; "
        f"{data['audit']['visuallyVerifiedWeightCells']} visually verified."
    )


if __name__ == "__main__":
    main()
