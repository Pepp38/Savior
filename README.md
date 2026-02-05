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

## Savior Core and SafeState Recovery

### Savior Core (this repository)

Savior Core is a **mechanical autosave and restore engine**.

It does one thing:

- capture form input continuously
- restore it verbatim after refresh, crash, or navigation

Core makes **no attempt to interpret or validate state**.

If a draft exists and is readable, it is restored as-is.

Core:
- does not judge correctness
- does not attempt recovery
- does not resolve ambiguity
- ignores corrupted or unreadable data (fail-soft)

This makes Core fast, predictable, and framework-agnostic — but intentionally naive.

---

### SafeState Recovery (separate module)

Some failure modes require **judgment**, not mechanics.

Examples:
- partially written drafts
- interrupted writes during crashes
- externally mutated storage
- structurally valid but semantically inconsistent state

For these cases, Savior offers an optional recovery layer:

> **Savior SafeState Recovery**  
> *Deterministic recovery when raw autosave is no longer trustworthy.*

SafeState:
- validates draft structure and invariants
- may refuse restoration when certainty does not exist
- guarantees that **only a technically valid application state** can be recovered

SafeState Recovery is **not included in Savior Core**.

Project site: https://zippers.dev

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

## Limitations

- Browser-only
- LocalStorage / SessionStorage only
- One draft per form

---

## Validation & testing

Savior is tested against *real-world breakage*, not ideal conditions.

Coverage includes:

- **18 automated test suites** (Vitest)
- **25 documented manual crash scenarios** (T01–T25)

---

## Installation

```bash
npm install @zippers/savior
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

---

*Savior is part of Zippers, a collection of small, focused tools.*

https://zippers.dev
