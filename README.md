# Savior

[![npm version](https://img.shields.io/npm/v/%40zippers%2Fsavior.svg)](https://www.npmjs.com/package/@zippers/savior)
![CI](https://github.com/Pepp38/Savior/actions/workflows/ci.yml/badge.svg?branch=forge)
![Bundle size](https://img.shields.io/bundlephobia/minzip/@zippers/savior)

## Automatic Form Draft Recovery

**Savior prevents users from losing what they type into forms.**  
Nothing more. Nothing less.

It is a tiny, dependency-free JavaScript library that automatically saves form input and restores it after a refresh, navigation, tab close, or browser crash.

No backend.  
No sync.  
No accounts.  
No framework coupling.

Just local, predictable draft recovery.

---

## Why does this exist?

Because forms fail in real life.

Browsers crash. Tabs close. Pages refresh.  
Users lose minutes or hours of input.

You can wire `localStorage` yourself. Most people do.  
Until they forget one edge case.

Savior exists to handle **all the boring, fragile parts** so you don’t have to.

---

## What Savior does (and why you might care)

- Autosaves input with a debounced strategy (400 ms by default)
- Restores drafts automatically after refresh or crash
- Clears drafts on successful submit
- Never throws unhandled exceptions
- Survives corrupted storage, quota limits, and driver failures
- Handles dynamic DOM changes predictably
- Supports multi-form pages with strict isolation
- Ships with LocalStorage and SessionStorage drivers
- Zero dependencies, framework-agnostic
- ESM and UMD builds

> All behavior has been validated through a 25-scenario manual crash-test suite (T01–T25).

---

## What Savior deliberately does NOT do

- No backend
- No cloud sync
- No encryption
- No analytics
- No framework-specific bindings
- No file inputs

If you need those things, this is not your tool.

---

## Reliability (v0.3.0)

Savior v0.3.0 has been tested against failure, not happy paths.

Validated scenarios include:

- Flaky storage drivers
- Invalid or corrupted JSON
- Dynamic fields added or removed at runtime
- Cloned forms and multi-form pages
- Stress input with hundreds of rapid updates
- External storage modification during typing

Across all scenarios, Savior maintained:

- Zero unhandled exceptions
- Stable restore behavior
- Strict per-form isolation
- Identical behavior across LocalStorage and SessionStorage

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

## Basic usage

```js
import Savior from '@zippers/savior';

Savior.init({
  selector: 'form[data-savior]'
});
```

---

## Limitations

- Browser-only
- LocalStorage / SessionStorage only
- One draft per form

---

*Savior is part of Zippers, a suite of small, focused tools developed by Pepp38.*
