# Automated test suite

The app starts through the native ES module entry point `js/app.js`; feature modules import their shared functions and state explicitly. UI actions are declared as `data-action-*` attributes and delegated through an explicit action map. The tests exercise the static app in a local HTTP server with real browser engines. They cover C56X table calculations and limits, BE20/B190 workbook-backed calculations, common takeoff and landing flows, aircraft changes, custom airports, saved inputs, invalid inputs, METAR parsing and MPS field preservation, HyperFormula runway-check restoration, externalized UI actions, and the service-worker download/retry/offline/update lifecycle.

## Run locally

```sh
npm ci
npx playwright install chromium webkit
npm test
```

The test runner starts its own local server on port 4173. Set `TEST_PORT` if that port is occupied. Tests run serially. PWA lifecycle cases use Chromium; the calculation and app interaction checks also run in WebKit in CI. On Windows, local runs use installed Google Chrome because Playwright WebKit requires libraries not supplied by its Windows package. To request WebKit locally where its dependencies are installed, set `EFB_RUN_WEBKIT=1`.

Reports are written to `playwright-report/` (HTML), `test-results/results.json` (JSON), and `test-results/junit.xml` (JUnit). Open the HTML report with:

```sh
npm run test:report
```

The test server has controlled modes for failed workbook requests, simulated offline responses, and a changed service-worker script. They apply only to the test server and do not modify production source files.

## App-update regression references

`tests/references/app-update-regression.json` is the approved comparison baseline for app version 0.544. The user approved it on 2026-11-09 to compare future app updates. It stores fixed inputs, visible outputs for BE20, B190 and C56X, direct C56X algorithm outputs, and SHA-256 hashes for the source data.

Every `npm test` run compares the current app with this baseline. A changed output fails the regression test and appears in the HTML, JSON and JUnit reports. The baseline records observed app behavior; approval here means approval for regression comparison only. It is not independent AFM verification or operational approval.

When changing the app or performance data, run the tests against that version and generate a fresh candidate:

```sh
npm test
npm run test:references:generate
```

The generator opens the app for each aircraft family and records the fixed ESSA runway scenarios, selected C56X function outputs, and SHA-256 hashes for relevant data files. It creates a timestamped JSON candidate under `reference-drafts/`; it never replaces the approved baseline or changes app data. Candidates are ignored by Git until deliberately promoted.

Compare a candidate's `references[].outputs` and `algorithmicOutputs` with the approved file. Review any differences against the intended app/data change and the applicable controlled source. If the new values are the desired app behavior, update the approved JSON deliberately, including its app version, approval date, inputs and source hashes. Do not promote a draft just because the test output changed.

### Recorded startup behavior to review

Reference cases set their target mass through the slider's `input` event before recording results. They compare the post-interaction calculation and do not assert that the initial, untouched slider state has already recalculated correctly.

BE20/B190 display RWCC 6 initially, but dispatching a change event for that same displayed value changes some results (BE20 takeoff TOR: 558 m to 522 m; B190 landing distance: 1,371 m to 1,258 m). The approved baseline preserves results with the initial RWCC state. Treat this, and the reported need to move the mass slider to refresh some BE20/B190 calculations, as recorded initialization/synchronization behavior to investigate; fixes will intentionally change regression outputs.

## Limits

These are software regression and browser compatibility tests, not approved aircraft performance data, flight-planning approval, or operational validation. WebKit testing is useful for browser-engine compatibility but does not reproduce an iPad, iOS PWA installation, storage eviction, or every iOS release. METAR is intentionally online-only; external METAR services are blocked in the automated suite.
