# Savior

**Automatic Form Draft Recovery**

Savior is a tiny, dependency-free autosave engine for HTML forms.  
It silently captures user input and restores it after a refresh, navigation, tab close, or browser crash — without a backend, account system, or integration friction.

Its goal is simple:  
**users should never lose what they write.**

---

## Features

- **Autosave (debounced, 400 ms by default)**
- **Automatic draft restore** after refresh / crash
- **Clean-up on submit** (no leftover data)
- **Never throws exceptions** — survives storage quota, private mode, JSON corruption
- **Predictable behavior** even with dynamic DOM changes
- **LocalStorage and SessionStorage drivers included**
- Zero dependencies, framework-agnostic
- ESM and UMD builds

All behavior validated through a 15-test manual crash-test suite.

---

## Installation

Savior ships as both **ESM** and **UMD**.

### ESM (recommended)

```html
<script type="module">
  import Savior from './savior.js';

  Savior.init({
    selector: 'form[data-savior]'
  });
</script>
```

### UMD

```html
<script src="./dist/savior.umd.js"></script>
<script>
  Savior.init({
    selector: 'form[data-savior]'
  });
</script>
```

---

## Usage

### Marking a form

```html
<form data-savior="contact-form">
  <input type="text" name="name">
  <input type="email" name="email">
  <textarea name="message"></textarea>
  <button type="submit">Send</button>
</form>
```

Initialize Savior:

```html
<script type="module">
  import Savior from './savior.js';
  Savior.init(); // uses selector "form[data-savior]"
</script>
```

Custom selector:

```js
Savior.init({
  selector: 'form.autosave'
});
```

---

## What gets saved?

Savior supports the following field types:

### Text-like inputs
- `text`, `email`, `url`, `number`
- `date`, `time`, `datetime-local`, `color`
- `<textarea>`

### Choice controls
- `<input type="checkbox">`
- `<input type="radio">`
- `<select>` (single and multiple)

### Safety rules
- Unsupported or missing fields are ignored silently  
- Password fields are never saved  
- Corrupted JSON cannot break restore  
- Dynamic DOM changes do not throw errors  

Drafts are stored per form in `localStorage` (or `sessionStorage` via custom driver).

---

## When does Savior clear drafts?

On a **successful `submit` event**, Savior automatically clears the draft for that form.  
No stale data. No surprises.

---

## API

### `Savior.checkSupport()`
Returns `true` if the current environment supports autosave safely.

### `Savior.init(options)`
Initializes autosave for all matching forms.

**Options:**

| Option             | Type     | Default              | Description                    |
|-------------------|----------|----------------------|--------------------------------|
| `selector`         | string   | `form[data-savior]`  | Which forms to attach to       |
| `driver`           | object   | LocalStorageDriver   | Storage backend                |
| `saveDelayMs`      | number   | 400                  | Debounce delay (ms)            |
| `debug`            | boolean  | false                | Enable console debugging       |
| `storageKeyPrefix` | string   | `savior:`            | Prefix for storage keys        |

### `Savior.getDraft(formId)`
Returns the raw draft object or `null`.

### `Savior.exportDraft(formId)`
Returns the draft as pretty-printed JSON.

### `Savior.clearDraft(formId)`
Deletes the stored draft for the given form.

---

## Drivers

### `LocalStorageDriver` (default)
Persists drafts across browser sessions.

### `SessionStorageDriver`
Persists drafts within the current tab only.

Custom drivers must implement:

- `save(formId, draft)`
- `load(formId)`
- `clear(formId)`

---

## Compatibility

- Modern browsers  
- Graceful degradation in restricted environments  
- Builds:
  - `savior.js` (ESM)
  - `dist/savior.umd.js` (UMD)

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
- LocalStorage or SessionStorage  
- One draft per form (by design)

---

## Roadmap

- Additional drivers  
- More field adapters  
- Per-field opt-out rules  
- Additional examples and guides  

---

## v0.3.0 — Release Notes

- Normalized public API  
- Documented internal workflow  
- Unified key computation strategy across drivers  
- Hardened behavior for unsupported storage, quota, JSON corruption  
- Improved field documentation  
- Zero breaking changes  

---

*Savior is part of **Zippers**, a suite of micro-tools developed by Pepp38
to improve the creation and development experience, one module at a time.*
