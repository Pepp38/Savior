# Manual test notes

This folder contains manual testing material used during development.

## Current manual suite

If you want a single source of truth, use:

- `tests/manual/README.md` (this file)
- the automated tests under `tests/automated/`

Legacy run logs have been moved to `tests/manual/archive/`.

## Philosophy

Manual testing is here to validate real-world scenarios (refresh, navigation, crashes, storage failures) that are hard to model perfectly in unit tests.

When updating Savior:
1. Run `npm test`
2. If behavior changed in a meaningful way, add a short note here or in a new file (dated), without embedding a version number in the filename.
