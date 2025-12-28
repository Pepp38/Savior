# Changelog

## v1.0.0 – 2025-12-28

First **stable** release.

This release marks the point where Savior’s public API and behavior are considered **stable and intentional**.

No breaking changes are expected without a major version bump.

### Stability guarantees
- Public API is frozen.
- Conservative, fail-soft behavior is now contractual.
- Silent by default (`debug: false` produces no console output).
- No unhandled exceptions in public code paths.
- Drafts are never cleared on ambiguous outcomes.

### Scope
- No backend
- No sync
- No framework bindings
- Browser-only autosave for HTML forms

---

## v0.4.1 (RC) – 2025-12-28

Hardening-only release. No new features.

### Changes
- Test command uses `vitest run` for reliability.
- Repo hygiene: removed old packed `.tgz` artifact and ignored `*.tgz`.
- Logging: warnings are emitted only when `debug: true`.
- Docs: removed outdated version references, updated README contract, and standardized changelog filename.

---

## v0.4.0 – 2025-12-27

Production hardening release. No scope expansion.

### Highlights
- Fail-soft adapters and submit-safe behavior for conservative draft handling.
- Checkbox group restore hardening and lifecycle cleanup.
- Optional TTL (`maxAgeMs`) for stale drafts.

---

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

---

## v0.2.1 (unreleased)

- Added internal `safeParse()` helper in `LocalStorageDriver` to harden JSON parsing.
- Unified debug logging between core and driver (driver warnings respect the `debug` flag).
- Added small helper API:
  - `Savior.getDraft(formId, options?)`
  - `Savior.clearDraft(formId, options?)`
  - `Savior.exportDraft(formId, options?)`
- Added `SessionStorageDriver` as an alternative persistence driver.

---

## v0.2.0 – 2025-11-29

- Initial hardened core/driver for autosave engine.
- ESM entry (`savior.js`) and UMD bundle (`dist/savior.umd.js`).
- Automatic save/restore/clear for HTML forms with field adapters.
