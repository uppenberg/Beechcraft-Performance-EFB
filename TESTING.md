# Automated test suite

The app starts through the native ES module entry point `js/app.js`; feature modules import their shared functions and state explicitly. UI actions are declared as `data-action-*` attributes and delegated through an explicit action map. The tests exercise the static app in a local HTTP server with real browser engines. They cover each registration's untouched startup, saved inputs for all three aircraft types, C56X table calculations and limits, BE20/B190 workbook-backed calculations, common takeoff and landing flows, aircraft changes, custom airports, invalid inputs, METAR parsing and MPS field preservation, HyperFormula runway-check restoration, externalized UI actions, and the service-worker download/retry/offline/update lifecycle. PWA tests include failed releases, multiple tabs and attempts to repair an old release with a newer file.

## Run locally

```sh
npm ci
npx playwright install chromium webkit
npm test
```

The test runner starts its own local server on port 4173. Set `TEST_PORT` if that port is occupied. Tests run serially. PWA lifecycle cases use Chromium; the calculation and app interaction checks also run in WebKit in CI. On Windows, local runs default to installed Google Chrome. To request WebKit locally, set `EFB_RUN_WEBKIT=1`. If Windows reports `libGLESv2.dll` missing despite the file being present in the Playwright WebKit folder, temporarily add that folder to the current shell's PATH:

GitHub Actions runs the test suite on Node.js 24 LTS. The workflow uses action releases that run on Node.js 24, so the runner does not need to force older Node.js 20 actions onto its newer runtime.

```powershell
$env:EFB_RUN_WEBKIT = '1'
$webkitFolder = Split-Path (node -p "require('playwright').webkit.executablePath()")
$env:PATH = "$webkitFolder;$env:PATH"
npm.cmd test -- --project=ipad-mini
```

`npm test` first checks the offline asset manifest, lints the app modules, service worker and test code, and type-checks the shared input and limit modules.

## JavaScript code coverage

CI gathers JavaScript coverage from the normal Chromium project and uploads a separate **code-coverage** artifact, alongside the Playwright report. Download and extract it into an empty folder, then open `index.html`. The GitHub job summary also contains the overall line, statement, function and branch figures. The HTML report shows individual files and highlights covered and uncovered lines. Newly added JavaScript modules under `js/` are included even if no test loads them, in which case their lines count as uncovered. The C56X loader and calculation code are included as well.

[Playwright's coverage API](https://playwright.dev/docs/api/class-coverage) runs only in Chromium; the prioritized iPad/WebKit tests still run normally, but do not contribute to these figures. Coverage is collected from each test's primary page. It does not include service workers, secondary pages, inline HTML scripts, CSS, workbook files, third-party libraries or the C56X tabular data scripts. V8 function and branch ranges are converted to Istanbul format; completely unloaded files do not contribute to the function and branch denominators because V8 provides no such metadata for them. A covered line means it executed, not that its result was asserted or independently verified. A filtered, failed or interrupted run can produce a partial report; check the associated Playwright report and test selection before comparing percentages. No percentage threshold blocks CI until a meaningful baseline has been reviewed.

To collect coverage locally in PowerShell:

```powershell
$env:EFB_COVERAGE = '1'
npm.cmd test
npm.cmd run coverage:report
Remove-Item Env:EFB_COVERAGE
```

Open `coverage-report/index.html`. Generate the report before starting another Playwright run, which would replace the test-result status used by the coverage summary. To measure only selected tests, pass their filenames or `--project=chromium` to Playwright; that report represents only those tests. When Playwright starts a new coverage-enabled run, it removes the preceding local coverage data and report.

Reports are written to `playwright-report/` (HTML), `test-results/results.json` (JSON), and `test-results/junit.xml` (JUnit). Open the HTML report with:

```sh
npm run test:report
```

## Supported device and focused UI checks

The product's full-support target is **iPad mini (A17 Pro), in portrait orientation only**. The `ipad-mini` project runs first in CI and uses an emulated 744 x 1133 CSS pixel viewport, scale factor 2, mobile behavior and touch input. It replaces the previous desktop WebKit profile; it does not add another full browser project. The generic recent iPad Safari user agent comes from Playwright, with the A17 Pro mini screen dimensions overridden explicitly. The physical screen is 1488 x 2266 pixels ([Apple specifications](https://support.apple.com/en-us/121456)). This profile does not pin or reproduce the user's installed iPadOS version, Safari chrome, keyboard or PWA standalone environment ([Playwright emulation](https://playwright.dev/docs/emulation)).

`tests/ipad-mini.spec.js` runs only in the `ipad-mini` project and checks all three aircraft families in 744 x 1133 portrait orientation. It tests touch navigation and focus, reads the selected ICAO back, checks horizontal overflow and controls outside the viewport, and attaches takeoff/landing screenshots even on success. On iPad mini screenshots only, a test stylesheet gives closed select controls the dark colors and chevron seen on the supplied iPad image; it does not change app files. The shim makes screenshots easier to compare, but cannot verify how the native iPadOS picker opens or behaves. These are geometric layout checks with screenshots for human review, not pixel-difference tests or complete accessibility certification. The remaining iPad-mini WebKit tests exercise existing app flows using the portrait profile. Chromium remains an engineering check and covers the service-worker lifecycle; it does not define another supported product device.

Before claiming a release is verified on the supported device, use the actual iPad mini and record its iPadOS version. Installation from Safari, offline relaunch of the installed PWA, updating that installation, rotation, the onscreen keyboard and VoiceOver require device checks. They are not verified by the GitHub VM.

## Functional coverage map

The suite is organized around application code and user-visible behavior; the user guide is a secondary cross-check. `tests/ui-feature-coverage.spec.js` covers the explicit UI-action registry, workbook formula import/conversion, settings and help navigation, update notices, ForeFlight URI, ICAO keyboard autocomplete, runway intersections and suggestions, invalid custom-airport values, result cards and chart markers, engine-out path display, runway availability, landing-mass warnings, registration errors and representative saved inputs for every aircraft family. `tests/metar.spec.js` covers parser, station/time validation, stale reports, weather preservation and runway suggestions for variable, calm, crosswind and reciprocal-runway wind. Existing calculation, initialization, stress and PWA specs cover the calculation engines, limits, recovery, offline cache and update lifecycle.

This matrix is functional regression coverage, not an exhaustive Cartesian product of every field value. New controls and branches should get a corresponding test when added. Playwright cannot verify that ForeFlight opens on a device, nor can the GitHub VM certify iPadOS installation, standalone relaunch, native keyboard behavior or VoiceOver; use the physical-device check above for those. AFM correctness and reference-value approval remain separate from this battery.

## AFM comparison report

`tests/afm-landing.spec.js` adds 12 exact Figure 4-44 table points from the supplied `LD f35_zero.pdf`, across PDF pages 1, 2, 7 and 14. Altitudes are 0, 3000 and 6000 ft, weights are within 13000-18700 lb, and the samples include tailwind, zero wind and headwind. Distances, VREF and VAPP are transcribed from the PDF in `tests/references/c56x-afm-figure-4-44.json`, with source SHA-256, conditions and page references. They are explicitly **pending user review**; passing tests do not approve the transcription. Expected values must not be regenerated from the app to make a failure pass.

The 12 calculations share one page load. Two additional scenarios enter values through the landing form, read back its fields, observe the actual arguments passed to the unmodified calculation and compare the displayed distance and speeds. A synthetic custom runway is created through the app for each altitude, with QNH 1013.25 hPa so the pressure altitude is exactly on the table node. No between-node interpolation is required for these Figure 4-44 distance/speed comparisons. Other results calculated by the app, such as maximum landing mass or climb limits, are outside this PDF comparison.

Each AFM test attaches `afm-comparison.html` and `afm-comparison.json` on success or failure. In the Playwright HTML report, select either test starting with **AFM Figure 4-44** and open its **AFM comparison (html)** attachment. The table shows input values, PDF/AFM page, expected value, actual value and difference. Expand each row's details to see complete inputs; the UI test includes requested form values, actual form values, engine inputs and displayed results. It also attaches screenshots of both successful form scenarios. The reports are self-contained and can be opened directly from the downloaded artifact's `test-results/` subfolders. An interrupted setup may produce a partial report; completed and expected case counts are shown explicitly.

The quantity compared is **AFM actual landing distance in feet**, before operational/runway factors, and the speed headings in KIAS. It is not the app's factored required distance or an approval of allowable landing weight. Positive wind is headwind and negative wind is tailwind. This small, inspectable set complements the pre-existing 80-cell reference and regression/matrix tests. It does not verify all AFM pages, slope charts or interpolation between nodes.

Run only the AFM cases with `npx playwright test tests/afm-landing.spec.js`. Enable `EFB_RUN_WEBKIT=1` locally to include the iPad mini profile, or use `--project=ipad-mini` with that variable to target it. CI runs the iPad mini profile first, then Chromium. The test count stays small by checking multiple reference points per browser session.

The test server has controlled modes for failed workbook requests, simulated offline responses, and a changed service-worker script. They apply only to the test server and do not modify production source files.

## App-update regression references

`tests/references/app-update-regression.json` is the approved comparison baseline for app version 0.544. The user approved it on 2026-11-09 to compare future app updates. It stores fixed inputs, visible outputs for BE20, B190 and C56X, direct C56X algorithm outputs, and SHA-256 hashes for the source data.

Every `npm test` run compares the current app with this baseline and the separately documented, intentional startup synchronization changes in `tests/references/startup-sync-changes.json`. The original approved baseline is preserved. A different output fails the regression test and appears in the HTML, JSON and JUnit reports. The baseline records observed app behavior; approval here means approval for regression comparison only. It is not independent AFM verification or operational approval.

The baseline's recorded source hashes are checked as well. For historical JavaScript and JSON hashes, the check accepts equivalent LF or CRLF line endings because the baseline was recorded on Windows. `tests/references/source-hash-changes.json` records that `data/airports.json` changed in commit `f604502`, after the 0.544 baseline and before this implementation. The exception records both hashes and is not an approval of the airport data. Any further change requires an explicit review of the fixture and affected outputs. For a separate data check, the C56X landing tests exercise 80 cells against the existing manually verified Figure 4-44 record in `tools/afm-audit/review/landing-distance-level-0ft-20000.verified.json`; this is not independent verification of every chart or calculation.

When changing the app or performance data, run the tests against that version and generate a fresh candidate:

```sh
npm test
npm run test:references:generate
```

The generator opens the app for each aircraft family and records the fixed ESSA runway scenarios, selected C56X function outputs, and SHA-256 hashes for relevant data files. It creates a timestamped JSON candidate under `reference-drafts/`; it never replaces the approved baseline or changes app data. Candidates are ignored by Git until deliberately promoted.

Compare a candidate's `references[].outputs` and `algorithmicOutputs` with the approved file. Review any differences against the intended app/data change and the applicable controlled source. If the new values are the desired app behavior, update the approved JSON deliberately, including its app version, approval date, inputs and source hashes. Do not promote a draft just because the test output changed.

### Corrected startup behavior

Reference cases set their target mass through the slider's `input` event before recording results. Additional tests now check the initial untouched controls against each workbook for every registration and verify that the C56X uses its own engine. The performance interface remains hidden until initialization completes. Workbook-backed mass, RWCC, flap and anti-ice controls are synchronized before results are shown; valid workbook weather values are displayed, and saved form inputs are subsequently restored.

The original baseline recorded BE20 takeoff TOR 558 m and B190 landing distance 1,371 m with the displayed RWCC 6 not yet synchronized. The corrected values for the same reference cases are 522 m and 1,258 m respectively. These differences are recorded explicitly without changing the approved historical baseline.

## Offline release snapshots

The service worker verifies each precached file against the generated SHA-256 manifest. A cached release serves its own files and app shell, including root navigation. If a cached file is missing, the worker can restore it from the server only when its hash matches; repair rejects files from another release. Installing a replacement uses a separate cache; failed installation retains the previous snapshot. An activated update reloads open app tabs so they load the new snapshot together.

For each release, update the version in `version.js` and the `app-release` meta tag in `index.html`. The bootstrap blocks the calculator if those two values differ, including when an older service worker serves a stale `version.js`. After all runtime files have been finalized, run:

```sh
npm run assets:generate
npm test
```

Commit `asset-files.json` and the generated `asset-manifest.js` together with the release. Add new runtime files to `asset-files.json`; CI checks the manifest and tests verify app imports and C56X loader files are included. `.gitattributes` fixes release text assets to LF and preserves the original C56X data files byte for byte, so the same manifest works on Windows and Linux. Save other release text files with LF before regenerating the manifest. The separate lint/type checks can be run with `npm run lint` and `npm run typecheck`. ESLint uses a pinned minimatch override for a patched development dependency; review it when upgrading ESLint.

## Code boundaries and precision

`js/performance-inputs.js` captures a common form snapshot with raw strings so an empty value is not confused with zero. The workbook adapter isolates workbook cell access; C56X continues to call its own calculation functions. `js/performance-limits.js` contains shared numeric comparisons without DOM dependencies. Distances and wind components are compared at full precision and then rounded for presentation; editable input fields retain the entered precision. Existing published calculation factors and gradient displays retain their specified decimal precision.

## Limits

These are software regression and browser compatibility tests, not approved aircraft performance data, flight-planning approval, or operational validation. WebKit testing is useful for browser-engine compatibility but does not reproduce an iPad, iOS PWA installation, storage eviction, or every iOS release. METAR is intentionally online-only; external METAR services are blocked in the automated suite.
