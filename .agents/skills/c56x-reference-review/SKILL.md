---
name: c56x-reference-review
description: Review C56X EFB code and exploratory scenarios against this repository's aircraft references; keep source PDFs read-only and avoid unsupported aircraft-data changes.
---

# C56X reference based code review

Use this skill to assess the Beechcraft Performance EFB for the C56X. The reference documents are source material for code review and improvement proposals; they are not files to modify.

## Reference files

- `referencefiles/Citation 560 Excel.pdf`
- `referencefiles/Section 7 - Advisory Information.pdf`

The supplied performance document identifies itself as FAA-approved Model 560XL Section IV, 56XFM-13, U.S. Configuration AA. The advisory document is Section VII for the same model/manual. The performance PDF also contains temporary FAA-approved changes and serial-number applicability statements. Before treating a chart or procedure as applicable, verify the aircraft serial/configuration and whether the relevant temporary changes have been incorporated or superseded. Do not assume this copy is the latest approved revision for an aircraft.

### Useful source map

- Section IV, PDF pages 5-11 (manual pages 4-5 to 4-11): general performance assumptions, definitions, and configuration context. Unless a chart says otherwise, performance uses pressure altitude; chart wind convention is positive headwind and negative tailwind; gradient convention is positive uphill and negative downhill. The manual says wind inputs are tower winds at 10 m above runway level.
- Section IV, PDF page 5 (manual page 4-5): if ambient temperature or altitude is below the lowest value shown on a performance chart, the manual directs using performance at that lowest shown value. Review this lower-bound rule when code rejects out-of-range inputs; do not apply it to values above chart maxima without a separate source instruction.
- Section IV, PDF page 509 (manual page 4-485): landing procedure. It calls for checking landing weight limits, then using Figure 4-44/45/46 according to runway gradient, and reviewing approach/landing climb gradients. The stated normal landing procedure applies at or below 18,700 lb; higher-weight values are additional emergency information.
- Section IV, PDF page 511 (manual page 4-487): anti-ice ON landing weight is limited by the lesser of the Figure 4-42 climb limit and Figure 4-43 brake-energy limit; Figure 4-42 alone does not include brake-energy limits.
- Section IV, PDF pages 518-547 (manual pages 4-494 to 4-523): Figure 4-44 zero-gradient landing-distance sheets. Figures 4-45 and 4-46 follow for downhill gradients. The charts are image-based; verify table nodes visually when transcribing values.
- Section VII, PDF pages 4-6 (manual pages 7-4 to 7-6): adverse runway guidance. It explicitly says this advisory performance is not FAA approved and does not replace Section IV limits/performance for non-contaminated runways. Its wet/contaminated charts use contaminant type and depth and describe distances/corrections as approximate minimums. Do not equate those charts with a generic RWCC multiplier.
- Section VII, PDF page 18 (manual page 7-18): Type II/III/IV anti-ice fluid advisory; the manual recommends Flaps T.O. and describes a 1.15 takeoff-field-length multiplier as approximate, with actual conditions potentially requiring more distance. Check applicability and how the app models fluid separately from ordinary anti-ice systems.

These page references are navigation aids for the supplied copies, not a substitute for checking the printed manual page, revision, applicability, chart notes, and source image.

Read the relevant sections of the PDFs before making aircraft-specific claims. Treat the Citation 560 document as aircraft-specific source material and Section 7 as advisory context. Do not assume a statement in advisory material overrides aircraft-specific limitations, approved procedures, or data. If the applicable hierarchy or meaning is unclear, report the ambiguity and ask for qualified review.

## Review workflow

1. Identify the exact C56X workflow and code paths under review. Keep the review focused on code and test improvements.
2. Locate the applicable reference material. Record the document name, page, table/figure, and applicable conditions for every aircraft-performance claim. If pages or content cannot be reliably read, state that limitation and do not infer missing values.
3. Compare implementation behavior with the source under matching aircraft configuration, weight, atmospheric conditions, runway conditions, and other stated assumptions. Separate confirmed mismatches from possible usability concerns and questions that need pilot or maintainer review.
4. For exploratory UI review, behave like a careful C56X pilot: check the sequence of inputs, units, defaults, warnings, limits, correction factors, and whether results and assumptions remain visible. Vary conditions only within documented ranges; test invalid/out-of-range inputs separately and label them as such.
5. Make scenarios reproducible. Record the app revision, scenario inputs, units, weather/runway assumptions, expected behavior or reference locator, observed behavior, and steps to reproduce. Prefer fixed scenario seeds over unrepeatable random values.
6. Before proposing a code or test change, inspect existing tests and open issues if available. Do not claim an issue is new without checking for duplicates.
7. Report findings with severity justified by evidence, the exact reproduction steps, expected versus observed behavior, source locator, and a suggested code/test improvement. Mark uncertain interpretation explicitly.

## Boundaries

- Never edit, regenerate, rename, move, or reformat either PDF. Treat `referencefiles/` source documents as read-only.
- Do not copy aircraft performance tables or bulk aircraft data into this skill, code, tests, generated files, or issues. Link findings to source locations instead.
- Do not change aircraft data, limits, correction factors, or calculations based only on an agent's interpretation. Any proposed numerical change requires direct verification against the applicable source and qualified human review.
- Do not present exploratory results or agent feedback as approved operational guidance, a substitute for the AFM/POH, or authorization for flight.
- Distinguish data correctness from human-factors feedback. An agent may flag confusing wording or workflow, but must not call a performance value wrong without a source-backed comparison.
- When the PDFs conflict, are ambiguous, or do not cover a case, preserve the uncertainty in the report; do not fill gaps by guessing.
- For contaminated runway scenarios, distinguish the Section IV dry/wet baseline and any app-specific RWCC correction from Section VII contaminant-specific charts. Section VII depends on contaminant type/depth and has explicit advisory/minimum-distance cautions; do not imply the generic RWCC pathway reproduces that chart performance.
- Check chart-boundary behavior against the manual's explicit lower-bound instruction: below-chart temperature/altitude may require use of the lowest chart value, while unsupported values above a chart maximum should remain unsupported unless the source says otherwise. Add boundary tests without copying new performance data unless the source is visually verified.
- When charts are image-only or OCR output is uncertain, inspect the rendered chart before confirming a numeric transcription. Preserve source identity and page/table provenance in the existing reference data rather than duplicating whole tables in this skill.

## Finding format

For each finding, provide:

- **Type:** calculation, input/validation, workflow/human factors, or documentation/test coverage
- **Scenario:** aircraft setup and relevant inputs, with units
- **Steps:** concise reproduction steps
- **Expected / observed:** clearly separated
- **Evidence:** PDF filename and page/table/figure, or explain why no direct reference was found
- **Confidence:** confirmed, likely, or needs qualified review, with a short reason
- **Suggested improvement:** code or test change to investigate; do not silently modify aircraft data
