# Changelog

## v0.3.0 – 2025-12-07

Stability-focused release.  
All manual tests (T01–T25) confirm a resilient autosave engine under normal, degraded, and hostile conditions: flaky storage drivers, corrupted JSON, dynamic forms, cloned nodes, stress-input events, and external storage alterations.

### Highlights
- No unhandled exceptions.
- Consistent and predictable restore behavior.
- LocalStorage and SessionStorage parity.
- Strict form isolation.
- Effective debouncing under heavy input load.

v0.3.0 establishes the hardened, production-ready autosave core for Savior.

## v0.2.1 (unreleased)

- Added internal `safeParse()` helper in `LocalStorageDriver` to harden JSON parsing.
- Unified debug logging between core and driver (driver warnings respect the `debug` flag).
- Added small helper API:
  - `Savior.getDraft(formId, options?)` – inspect the raw draft for a given form.
  - `Savior.clearDraft(formId, options?)` – clear the stored draft.
  - `Savior.exportDraft(formId, options?)` – export the draft as pretty-printed JSON.
- Added `SessionStorageDriver` as an alternative persistence driver.

## v0.2.0 – 2025-11-29

- Initial hardened core/driver for autosave engine.
- ESM entry (`savior.js`) and UMD bundle (`dist/savior.umd.js`).
- Automatic save/restore/clear for HTML forms with field adapters.



