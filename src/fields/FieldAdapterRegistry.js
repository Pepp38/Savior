// src/fields/FieldAdapterRegistry.js
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
