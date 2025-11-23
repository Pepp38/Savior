
<p align="center">
  <img src="./banner.png" alt="Savior Banner" />
</p>

# Savior

**Automatic Form Draft Recovery**

Savior is an ultra-light autosave engine for web forms.  
It silently captures user input and restores it automatically after a tab close, page refresh, navigation, or browser crash.

Goal: prevent users from losing what they write — no backend, no setup friction.

---

## Currently working on

- Extended field support (checkbox, radio, select-multiple)
- Internal FieldAdapter system

## Next upgrade

- Cleanup of LocalStorageDriver
- - IndexedDB / hybrid drivers

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

Savior ships as an ES module.

```js
import { Savior } from './savior.js';
```

(UMD build coming soon.)

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
- **saveDelayMs** — delay before saving after user input (default: 400ms)
- **driver** — storage mechanism (default: LocalStorageDriver)

`Savior.init()` returns the internal core instance.

---

## Architecture (MVP)

### Autosave Core

- Detects forms  
- Listens to `input` / `change`  
- Saves draft after a delay  
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

### Storage Driver

- MVP: `LocalStorageDriver` using `window.localStorage`.

---

## Current Limitations

- Password fields are not saved  
- Advanced field support (checkbox, radio, select-multiple) missing

---

## Roadmap

- IndexedDB / hybrid drivers  
- TypeScript version  
- UMD bundle + npm release  
- Automated tests  
- Extended field compatibility  

---

## Branding Palette

```
Primary:      #0C161D
Secondary:    #1B2A38
Accent:       #8C5A2B
Neutral dark: #1A1A1A
Neutral light:#D9DEE2
```

---

## License

To be defined.

**Status:** MVP under active development.
