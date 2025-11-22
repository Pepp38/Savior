<p align="center">
  <img src="./banner.png" alt="Savior Banner" />
</p>

# Savior

**Automatic Form Draft Recovery**

Savior is a lightweight autosave engine for web forms.  
It silently captures the user’s input and restores it after a tab close, page refresh, back/forward navigation, or browser crash.

Goal: keep users from losing what they write — no backend, no heavy setup, no friction.

---

## Badges

![version](https://img.shields.io/badge/version-0.1.0-1B2A38?labelColor=0C161D)
![status](https://img.shields.io/badge/status-MVP%20active-1B2A38?labelColor=0C161D)
![built](https://img.shields.io/badge/built%20by-PLC%20Creates-1B2A38?labelColor=0C161D)

---

## Why I built this

I kept losing text in forms while working on small demos and prototypes.  
Tabs closed. Pages reloaded. Everything disappeared.

I wanted something simple and predictable — so I built it.

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

Your form is now protected against data loss.

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

- **selector** — forms to protect (default: `form[data-savior]`)
- **saveDelayMs** — debounce delay before saving (default: 400ms)
- **driver** — storage mechanism (default: LocalStorageDriver)

`Savior.init()` returns the internal core instance (`SaviorCore`).

---

## Architecture (MVP)

### 1. Autosave Core

- Detects forms using the selector  
- Listens to user input (`input`, `change`)  
- Saves a draft after a delay  
- Restores on page load  
- Clears on submit  

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

- MVP driver: `LocalStorageDriver` using `window.localStorage`.

---

## Current Limitations

- Password fields are not saved (security)
- Full support only for text-based fields
- Checkbox, radio, select-multiple support coming soon

---

## Roadmap

- IndexedDB / server / hybrid drivers  
- TypeScript version  
- UMD bundle + npm release  
- Automated tests  
- Extended form field compatibility  

---

## Branding Palette

```
Primary:      #0C161D
Secondary:    #1B2A38
Accent:       #8C5A2B (Dark Copper)
Neutral dark: #1A1A1A
Neutral light:#D9DEE2
```

---

## License

To be defined.

**Status:** MVP under active development.
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
