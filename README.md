# Savior

[![npm version](https://img.shields.io/npm/v/%40zippers%2Fsavior.svg)](https://www.npmjs.com/package/@zippers/savior)

**Automatic Form Draft Recovery**

Savior is a tiny, dependency-free autosave engine for HTML forms.  
It silently captures user input and restores it after a refresh, navigation, tab close, or browser crash — without a backend, account system, or integration friction.

Its goal is simple:  
**users should never lose what they write.**

---

## Features

- Autosave (debounced, 400 ms by default)
- Automatic draft restore after refresh or crash
- Clean-up on submit
- Never throws exceptions — survives driver failures, JSON corruption, quota limits
- Predictable behavior with dynamic DOM changes
- LocalStorage and SessionStorage drivers included
- Zero dependencies, framework-agnostic  
- ESM and UMD builds

> All behavior validated through a 25-test manual crash-test suite (T01–T25).

---

## Reliability (v0.3.0)

Savior v0.3.0 has been validated across the full resilience matrix:

- Flaky drivers (random failures in save/load/clear)
- Invalid or corrupted JSON
- Dynamic and deleted fields
- Cloned forms and multi-form pages
- Stress input (hundreds of rapid updates)
- External storage modifications during typing

Across all scenarios, Savior maintained:

- Zero unhandled exceptions  
- Stable restore behavior  
- Strict per-form isolation  
- LocalStorage / SessionStorage parity  

---

## Installation

Savior is available on npm under the `@zippers` scope.

```bash
npm install @zippers/savior
# or
pnpm add @zippers/savior
# or
yarn add @zippers/savior
```

---

## Usage

### Using ESM (recommended)

```js
import Savior from '@zippers/savior';

Savior.init({
  selector: 'form[data-savior]'
});
```

### Using UMD

```html
<script src="node_modules/@zippers/savior/dist/savior.umd.js"></script>
<script>
  Savior.init({
    selector: 'form[data-savior]'
  });
</script>
```

---

## Marking a form

```html
<form data-savior="contact-form">
  <input type="text" name="name">
  <input type="email" name="email">
  <textarea name="message"></textarea>
  <button type="submit">Send</button>
</form>
```

Initialize:

```js
import Savior from '@zippers/savior';
Savior.init(); // default selector: form[data-savior]
```

Custom selector:

```js
Savior.init({
  selector: 'form.autosave'
});
```

---

## What gets saved?

### Text-like inputs
- text, email, url, number
- date, time, datetime-local, color
- textarea

### Choice controls
- checkbox
- radio
- select (single & multiple)

### Safety rules
- Unsupported fields are ignored  
- Passwords are never saved  
- Corrupted JSON is handled silently  
- Dynamic DOM changes never break restore  

Drafts are stored per form using LocalStorage (or SessionStorage via custom driver).

---

## When does Savior clear drafts?

On a successful submit event, Savior automatically clears the draft for that form.  
No stale data. No surprises.

---

## API

### `Savior.checkSupport()`
Returns true if autosave can operate safely.

### `Savior.init(options)`
Initializes autosave for matching forms.

| Option             | Type     | Default              | Description                    |
|-------------------|----------|----------------------|--------------------------------|
| selector         | string   | form[data-savior]  | Forms to attach to             |
| driver           | object   | LocalStorageDriver   | Storage backend                |
| saveDelayMs      | number   | 400                  | Debounce delay (ms)            |
| debug            | boolean  | false                | Enable console debugging       |
| storageKeyPrefix | string   | savior:            | Prefix for storage keys        |

### `Savior.getDraft(formId)`
Returns the draft object or null.

### `Savior.exportDraft(formId)`
Returns the draft as pretty-printed JSON.

### `Savior.clearDraft(formId)`
Clears the stored draft.

---

## Drivers

### LocalStorageDriver (default)
Persists drafts across browser sessions.

### SessionStorageDriver
Persists drafts within the current tab.

Custom drivers must implement:

- save(formId, draft)
- load(formId)
- clear(formId)

---

## Compatibility

- Modern browsers  
- Graceful degradation in restricted environments  
- Distributed as:
  - savior.js (ESM)
  - dist/savior.umd.js (UMD)

---

## Project Structure

```
src/
  core/
  drivers/
  fields/

savior.js
dist/
  savior.umd.js
  savior.umd.js.map

examples/
  demo.html
  umd-demo.html
```

---

## Limitations

- Browser only  
- No file inputs  
- LocalStorage / SessionStorage only  
- One draft per form (by design)

---

## Roadmap

- Additional drivers  
- More field adapters  
- Per-field opt-out rules  
- Expanded examples and guides  

---

## v0.3.0 — Release Notes

- Stability-focused release  
- Unified storage key strategy  
- Hardened behavior for unsupported storage, quota issues, and corrupted JSON  
- Predictable restore with dynamic/cloned forms  
- Debounce performance validated through stress testing  
- Zero breaking changes  

---

*Savior is part of Zippers, a suite of micro-tools developed by Pepp38  
to improve the creation and development experience — one module at a time.*
