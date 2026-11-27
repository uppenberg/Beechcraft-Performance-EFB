# METAR sources

The app tries METAR sources in this order:

1. **MET Norway Tafmetar** — direct browser `GET` to `https://api.met.no/weatherapi/tafmetar/1.0/metar.txt?icao={ICAO}`.
2. **Cloudflare Worker** — `https://metar-proxy.uppenberg1.workers.dev/?icao={ICAO}`.
3. **Netlify Proxy** — `/api/reports/metar?ids={ICAO}&format=raw`.

Each source has a five-second timeout. A response must match the requested ICAO and contain a valid observation time no more than 60 minutes old; otherwise fetching continues with the next source.

## MET Norway response handling

Tafmetar returns METAR reports for the preceding 24-hour period as multiple lines. The app filters for the requested ICAO, validates the candidate reports, and selects the valid report with the smallest age. This avoids validating the oldest report simply because it appears first. If no recent valid report exists, the Cloudflare Worker is tried next.

The Tafmetar documentation describes global coverage of about 4,000 airports, rather than all ICAO airports. Reports outside Norway are discarded after 24 hours, while Norwegian reports are archived. Missing stations and stale reports therefore rely on the configured fallbacks.

## Browser access and usage

The direct Tafmetar endpoint was fetched successfully from a local browser origin in Chrome and WebKit. MET Norway permits low-volume, simple cross-origin JavaScript requests; browser requests identify the app through the automatically supplied `Origin` header. Keep this as a plain `GET` without custom request headers, and avoid unnecessary repeated requests. MET Norway recommends a proxy for privacy and caching if traffic grows. Review the [Terms of Service](https://docs.api.met.no/doc/TermsOfService.html) and [Tafmetar documentation](https://api.met.no/weatherapi/tafmetar/1.0/documentation) if request behavior changes.

## Attribution

MET Norway weather data is available under [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/). Credit the data as **MET Norway Tafmetar API** and link to the license. This app filters the response to the requested ICAO, selects the newest valid report, and normalizes the bulletin terminator and report prefix for display.
