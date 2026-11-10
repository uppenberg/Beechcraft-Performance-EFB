# Automated test suite

The app starts through the native ES module entry point `js/app.js`; feature modules import their shared functions and state explicitly. UI actions are declared as `data-action-*` attributes and delegated through an explicit action map. The tests exercise the static app in a local HTTP server with real browser engines. They cover each registration's untouched startup, saved inputs for all three aircraft types, C56X table calculations and limits, BE20/B190 workbook-backed calculations, common takeoff and landing flows, aircraft changes, custom airports, invalid inputs, METAR parsing and MPS field preservation, HyperFormula runway-check restoration, externalized UI actions, and the service-worker download/retry/offline/update lifecycle. PWA tests include failed releases, multiple tabs and attempts to repair an old release with a newer file.

## Run locally

```sh
npm ci
npx playwright install chromium webkit
npm test
```

The test runner starts its own local server on port 4173. Set `TEST_PORT` if that port is occupied. Tests run serially. PWA lifecycle cases use Chromium; the calculation and app interaction checks also run in WebKit in CI. On Windows, local runs default to installed Google Chrome. To request WebKit locally, set `EFB_RUN_WEBKIT=1`. If Windows reports `libGLESv2.dll` missing despite the file being present in the Playwright WebKit folder, temporarily add that folder to the current shell's PATH:

```powershell
$env:EFB_RUN_WEBKIT = '1'
$webkitFolder = Split-Path (node -p "require('playwright').webkit.executablePath()")
$env:PATH = "$webkitFolder;$env:PATH"
npm.cmd test -- --project=webkit
```

`npm test` first checks the offline asset manifest, lints the app modules and service worker, and type-checks the shared input and limit modules.

Reports are written to `playwright-report/` (HTML), `test-results/results.json` (JSON), and `test-results/junit.xml` (JUnit). Open the HTML report with:

```sh
npm run test:report
```

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
