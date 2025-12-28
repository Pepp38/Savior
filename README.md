# Savior

**Stop users from losing form input. Automatically.**

Savior is a tiny, dependency-free JavaScript library that prevents users from losing form input when pages refresh, tabs close, or browsers crash.

No backend.  
No sync.  
No accounts.  
No framework coupling.

Built for the moments when forms fail and users shouldn’t pay the price.

---

## Why this exists

Because form persistence *looks* trivial until it isn’t.

Yes, you can wire `localStorage` yourself. Most teams do.  
Until one of these happens:

- storage contains corrupted or partial JSON  
- dynamic fields are added or removed after initialization  
- a submit partially fails  
- multiple forms coexist on the same page  
- storage quota is exceeded  
- the page crashes mid-write  

Savior exists to handle those boring, fragile edge cases consistently, so application code doesn’t have to.

---

## What it does

- Automatically saves form inputs with a debounced strategy (400 ms default)
- Restores drafts after refresh, crash, or navigation
- Clears drafts on successful submit
- Handles dynamic DOM changes predictably
- Isolates drafts per form (no cross-pollution)
- Survives corrupted storage and flaky drivers
- Never throws unhandled exceptions
- Ships with LocalStorage and SessionStorage drivers
- Zero dependencies, framework-agnostic
- ESM + UMD builds

**All behavior is validated against failure modes, not happy paths.**

---

## What it deliberately does NOT do

- No backend
- No cloud sync
- No encryption
- No analytics
- No framework bindings
- No file inputs

If you need any of the above, this is not your tool.

---

## Validation & testing

Savior is tested against *real-world breakage*, not ideal conditions.

Coverage includes:

- **18 automated test suites** (Vitest)
- **25 documented manual crash scenarios** (T01–T25)

Tested scenarios include:

- Corrupted or invalid storage
- Flaky or failing storage drivers
- Dynamic field insertion/removal
- Multi-form pages and cloned forms
- Stress input with rapid updates
- External storage mutation during typing

Across all scenarios, Savior maintained:

- Zero unhandled exceptions
- Stable restore behavior
- Strict per-form isolation
- Identical behavior across storage drivers

---

## Installation

```bash
npm install @zippers/savior
# or
pnpm add @zippers/savior
# or
yarn add @zippers/savior
```

---

## Minimal usage

```html
<form data-savior>
  <input name="email" />
  <textarea name="message"></textarea>
</form>
```

```js
import Savior from '@zippers/savior';

Savior.init({
  selector: 'form[data-savior]'
});
```

That’s it.

---

## Limitations

- Browser-only
- LocalStorage / SessionStorage only
- One draft per form

---

## Scope statement

Savior does **one thing**:

> Ensure users don’t lose typed input when forms fail in real life.

Nothing more. Nothing less.

---

*Savior is part of Zippers, a collection of small, focused tools.*
---

## API Reference

### `Savior.init(options?)`

Initializes Savior and attaches to matching forms.

### `Savior.destroy()`

Detaches listeners and stops timers.

### `Savior.getDraft(formId, options?)`

Returns the current stored draft for a given `formId` (or `null` if none / stale).

### `Savior.clearDraft(formId)`

Clears the stored draft for `formId`.

### `Savior.exportDraft(formId)`

Exports the stored draft payload (useful for debugging or support).

### `Savior.checkSupport(driver?)`

Returns `{ supported: boolean, reason?: string }` for the chosen driver (or default).

### Drivers

- `LocalStorageDriver`
- `SessionStorageDriver`

---

## Options

- `selector` (string): CSS selector used to find forms. Default: `form[data-savior]`
- `saveDelayMs` (number): debounce delay before persisting input.
- `debug` (boolean): when `true`, enables warnings and debug logs. Default: `false` (silent).
- `storageKeyPrefix` (string): key prefix used by storage drivers.
- `clearOnSubmit` (boolean): conservative clear behavior on submit.
- `restoreOn` (string | string[]): when to restore drafts (ex: `"startup"`, `"focus"`, etc).
- `maxAgeMs` (number): TTL for stored drafts. Stale drafts are ignored.

If an option is invalid, Savior falls back to safe defaults. With `debug: false`, this is silent.

---

## Production guarantees

Savior is designed to be boring and conservative:

- It **does not crash your app**: `init()` and restore paths are fail-soft.
- It is **conservative with user data**: drafts are never cleared on ambiguous outcomes.
- It **does not clear synchronously on submit**.
- If a submit is prevented or fails, the draft remains.
- Storage corruption is handled fail-soft (corrupted drafts are ignored, not fatal).
- If `maxAgeMs` is set, drafts older than the TTL are ignored (treated as stale).

### SPA note: clearing is manual after success

In SPAs, Savior cannot know if a request truly succeeded. After a successful submit, you must clear:

```js
Savior.clearDraft(formId);
```

This is the conservative default.

---

## Recipes

### SPA submit handler

```js
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formId = form.getAttribute('data-savior-id') || 'contact';
  const ok = await submitToApi(new FormData(form));

  if (ok) Savior.clearDraft(formId);
});
```

### Multiple forms

Use a clear `formId` per form (data attribute or explicit id) and keep `selector` narrow.

### Driver override

```js
import Savior, { LocalStorageDriver } from "savior";

Savior.init({
  driver: new LocalStorageDriver({ storageKeyPrefix: "myapp_", debug: false }),
});
```
