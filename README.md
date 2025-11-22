# Savior

**Automatic Form Draft Recovery**

Savior is an ultra-light autosave engine for web forms. It silently captures the user’s input and restores it automatically after a tab close, page refresh, back/forward navigation, or browser crash.

Goal: prevent users from losing what they write — with no backend, no heavy setup, and zero friction.

---

## Features (MVP)

- Automatic saving using `localStorage`
- Instant restoration on page load
- Auto-cleanup on `submit`
- Setup in seconds
- No dependencies
- Works with standard HTML forms (text-based fields)

---

## Installation

Savior currently ships as an ES module.

```js
import { Savior } from './savior.js';
```

(UMD build with `<script src="...">` support coming soon.)

---

## Basic Usage

### 1. Mark a form

```html
<form data-savior="contact-form">
  <input name="email" />
  <textarea name="message"></textarea>
</form>
```

### 2. Activate Savior

```html
<script type="module">
  import { Savior } from './savior.js';

  Savior.init({
    selector: 'form[data-savior]'
  });
</script>
```

The form is now protected against data loss.

---

## Options

```js
Savior.init({
  selector: 'form[data-savior]', // Forms to protect
  saveDelayMs: 400,              // Debounce delay before saving
  driver: new Savior.LocalStorageDriver({
    storageKeyPrefix: 'savior_draft_'
  })
});
```

### Details

- selector: selects which forms to protect. Default: `form[data-savior]`
- saveDelayMs: delay before saving after user input (ms). Default: 400
- driver: storage mechanism. Default: LocalStorageDriver

`Savior.init()` returns an internal instance (`SaviorCore`).

---

## Architecture (MVP)

### 1. Autosave Core

- Detects forms using `selector`
- Listens to user input (`input`, `change`)
- Saves a draft after a delay (`saveDelayMs`)
- Restores the draft on page load
- Clears the draft on `submit`

### Draft Structure

```json
{
  "formId": "demo-form",
  "timestampUtc": "2025-11-21T20:42:20.001Z",
  "fields": {
    "email": "user@example.com",
    "message": "Hello..."
  }
}
```

### 2. Storage Driver

MVP driver: LocalStorageDriver using `window.localStorage`.

---

## Current Limitations

- password fields are not saved (security)
- Text-based fields fully supported
- Advanced support (checkbox, radio, select multiple) coming soon

---

## Roadmap

- Server / hybrid / IndexedDB drivers
- TypeScript version
- UMD bundle + npm release
- Automated tests

---

## License

To be defined.

Status: MVP under active development.
