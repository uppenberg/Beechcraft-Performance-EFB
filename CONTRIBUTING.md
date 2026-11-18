# Application code

Aim for at most two nested control-flow blocks per function. The maximum is three. ESLint checks application JavaScript in `js/` and the service worker with `max-depth`. Prefer early exits or a named function for a distinct piece of work when that makes the logic easier to follow.
