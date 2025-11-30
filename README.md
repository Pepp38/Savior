
<p align="center">
  <img src="./banner.png" alt="Savior Banner" />
</p>

# Savior

**Automatic Form Draft Recovery**

Savior is a tiny, dependency-free autosave engine for web forms.\
It silently captures user input and restores it after a tab close, page
refresh, navigation, or browser crash.

Goal: prevent users from losing what they write --- no backend, no
account, no setup friction.

------------------------------------------------------------------------

## Features

-   **Autosave (debounced, 400 ms by default)**\
-   **Automatic draft restore** after refresh, crash, or navigation\
-   **Clean-up on submit** (no leftover data)\
-   **No exceptions** when storage is full or unavailable\
-   **JSON corruption protection**\
-   **Support check** via `Savior.checkSupport()`\
-   **LocalStorage driver included**\
-   Zero dependencies, framework-agnostic\
-   ESM and UMD builds included

------------------------------------------------------------------------

## Installation

Savior ships as both **ESM** and **UMD**.

### ESM

``` html
<script type="module">
  import Savior from './savior.js';

  Savior.init({
    selector: 'form[data-savior]'
  });
</script>
```

### UMD

``` html
<script src="./dist/savior.umd.js"></script>
<script>
  Savior.init({
    selector: 'form[data-savior]'
  });
</script>
```

------------------------------------------------------------------------

## Usage

### Marking forms

``` html
<form data-savior="contact-form">
  <input type="text" name="name">
  <input type="email" name="email">
  <textarea name="message"></textarea>
  <button type="submit">Send</button>
</form>
```

Initialize Savior:

``` html
<script type="module">
  import Savior from './savior.js';

  Savior.init(); // uses selector "form[data-savior]"
</script>
```

Custom selector:

``` js
Savior.init({
  selector: 'form.autosave'
});
```

------------------------------------------------------------------------

## What gets saved?

-   text-like inputs\
-   textarea\
-   select\
-   checkboxes\
-   radio groups

Savior stores drafts per form in `localStorage` and restores them
automatically.

------------------------------------------------------------------------

## When does it clear drafts?

On `submit`, Savior clears the stored draft for that form.

------------------------------------------------------------------------

## API

### `Savior.checkSupport()`

Returns `true` if autosave is supported.

### `Savior.init(options)`

Options:

  Option          Type      Default               Description
  --------------- --------- --------------------- ----------------
  `selector`      string    `form[data-savior]`   CSS selector
  `driver`        object    LocalStorageDriver    Storage driver
  `saveDelayMs`   number    400                   Debounce delay
  `debug`         boolean   false                 Console logs

### `Savior.LocalStorageDriver`

Default driver implementing:

-   `save(formId, draft)`\
-   `load(formId)`\
-   `clear(formId)`

------------------------------------------------------------------------

## Compatibility

-   Modern browsers\
-   Works in restricted environments (logs only in debug)\
-   Builds:
    -   `savior.js` (ESM)\
    -   `dist/savior.umd.js` (UMD)

------------------------------------------------------------------------

## Project Structure

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

------------------------------------------------------------------------

## Limitations

-   Browser only\
-   LocalStorage only\
-   No file fields\
-   Standard controls only\
-   One draft per form

------------------------------------------------------------------------

## Roadmap

-   More drivers\
-   Better field coverage\
-   Per-field opt-out\
-   More examples

------------------------------------------------------------------------

## v0.2.0 --- Release Notes

-   Hardened LocalStorageDriver\
-   Added `checkSupport()`\
-   Clarified core API\
-   Confirmed ESM + UMD support\
-   Internal cleanup\
-   No breaking changes

Savior fait partie de **Zippers**, une suite de micro-outils développée par Pepp38
pour améliorer l’expérience de création et de développement, un module à la fois.
