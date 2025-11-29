# Changelog

## v0.2.1 (unreleased)

- Added internal `safeParse()` helper in `LocalStorageDriver` to harden JSON parsing.
- Unified debug logging between core and driver (driver warnings respect the `debug` flag).
- Added small helper API:
  - `Savior.getDraft(formId, options?)` – inspect the raw draft for a given form.
  - `Savior.clearDraft(formId, options?)` – clear the stored draft.
  - `Savior.exportDraft(formId, options?)` – export the draft as pretty-printed JSON.

## v0.2.0 – 2025-11-29

- Initial hardened core/driver for autosave engine.
- ESM entry (`savior.js`) and UMD bundle (`dist/savior.umd.js`).
- Automatic save/restore/clear for HTML forms with field adapters.
