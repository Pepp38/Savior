// src/fields/CheckboxFieldAdapter.js
import { FieldAdapter } from './FieldAdapter.js';

export class CheckboxFieldAdapter extends FieldAdapter {
  /**
   * @param {HTMLElement} element
   * @returns {boolean}
   */
  canHandle(element) {
    return (
      element instanceof HTMLInputElement &&
      element.type === 'checkbox'
    );
  }

  /**
   * Read the checked state of the checkbox.
   *
   * For now we store a simple boolean:
   *   true  -> checked
   *   false -> unchecked
   *
   * @param {HTMLInputElement} element
   * @returns {boolean}
   */
  readValue(element) {
    return !!element.checked;
  }

  /**
   * Restore the checked state from a boolean.
   *
   * @param {HTMLInputElement} element
   * @param {unknown} value
   */
  writeValue(element, value) {
    element.checked = Boolean(value);
  }
}
