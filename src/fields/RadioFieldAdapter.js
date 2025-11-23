// src/fields/RadioFieldAdapter.js
import { FieldAdapter } from './FieldAdapter.js';

export class RadioFieldAdapter extends FieldAdapter {
  /**
   * @param {HTMLElement} element
   * @returns {boolean}
   */
  canHandle(element) {
    return (
      element instanceof HTMLInputElement &&
      element.type === 'radio'
    );
  }

  /**
   * Read selected value for a radio group.
   *
   * Convention:
   * - If this radio is NOT checked => return undefined (nothing to save)
   * - If it is checked           => return its value (string)
   *
   * @param {HTMLInputElement} element
   * @returns {string|undefined}
   */
  readValue(element) {
    if (!element.checked) {
      // Don't overwrite existing value for this name
      return undefined;
    }

    // Default to "on" if no explicit value is set
    return element.value ?? 'on';
  }

  /**
   * Restore radio group state.
   *
   * Called for every radio with the same name.
   * Only the one whose value matches the savedValue will become checked.
   *
   * @param {HTMLInputElement} element
   * @param {unknown} savedValue
   */
  writeValue(element, savedValue) {
    if (typeof savedValue !== 'string') {
      element.checked = false;
      return;
    }

    element.checked = (element.value === savedValue);
  }
}

