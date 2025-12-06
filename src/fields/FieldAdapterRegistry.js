// src/fields/FieldAdapterRegistry.js

/**
 * FieldAdapterRegistry – Supported Field Types (v0.3.0)
 *
 * Savior uses a pluggable adapter system to read/write field values safely.
 * Each adapter implements:
 *    - canHandle(element): boolean
 *    - readValue(element): any
 *    - writeValue(element, value): void
 *
 * The default adapter set supports the following HTML form controls:
 *
 * 1. Text-like inputs (TextFieldAdapter)
 *    - <input type="text">
 *    - <input type="email">
 *    - <input type="url">
 *    - <input type="number">
 *    - <input type="date">
 *    - <input type="time">
 *    - <input type="datetime-local">
 *    - <input type="color">
 *    - <textarea>
 *
 * 2. Checkboxes (CheckboxFieldAdapter)
 *    - <input type="checkbox">
 *    Saves / restores boolean values.
 *
 * 3. Radio groups (RadioFieldAdapter)
 *    - <input type="radio">
 *    Saves the selected value (string) or ignores when none selected.
 *
 * 4. Select controls (SelectFieldAdapter)
 *    - <select> (single)
 *    - <select multiple> (if implemented by the adapter)
 *
 * 5. Generic value-based inputs (ValueFieldAdapter)
 *    - Fallback adapter for simple value-bearing fields.
 *    - Handles inputs where value can be safely read/written.
 *
 * Safety guarantees:
 *    - Unsupported fields are simply ignored (never cause errors).
 *    - Missing fields during restore are skipped silently.
 *    - Corrupted values and unexpected types are handled safely.
 *
 * To extend Savior:
 *    - You can add custom adapters at runtime via getDefaultFieldAdapters().
 */


import { TextFieldAdapter } from './TextFieldAdapter.js';
import { CheckboxFieldAdapter } from './CheckboxFieldAdapter.js';
import { RadioFieldAdapter } from './RadioFieldAdapter.js';
import { SelectFieldAdapter } from './SelectFieldAdapter.js';
import { ValueFieldAdapter } from './ValueFieldAdapter.js';

const defaultAdapters = [
  new TextFieldAdapter(),
  new CheckboxFieldAdapter(),
  new RadioFieldAdapter(),
  new SelectFieldAdapter(),
  new ValueFieldAdapter()
];

/**
 * Returns the first adapter that can handle the given field element.
 *
 * @param {HTMLElement} element
 * @param {FieldAdapter[]} [adapters]
 * @returns {FieldAdapter|null}
 */
export function getFieldAdapterForElement(element, adapters = defaultAdapters) {
  for (const adapter of adapters) {
    try {
      if (adapter.canHandle(element)) {
        return adapter;
      }
    } catch (error) {
      // Safety net: one bad adapter should not break everything
      // You could log this in a debug mode.
      continue;
    }
  }

  return null;
}

/**
 * Expose the default adapters array if you need to extend it at runtime.
 */
export function getDefaultFieldAdapters() {
  return defaultAdapters;
}
