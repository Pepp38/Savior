// src/fields/SelectFieldAdapter.js
import { FieldAdapter } from './FieldAdapter.js';

export class SelectFieldAdapter extends FieldAdapter {

  canHandle(element) {
    return element instanceof HTMLSelectElement;
  }

  /**
   * Read selected value(s):
   * - single select => string
   * - multiple select => array of strings
   * - none selected => undefined
   */
  readValue(element) {
    if (element.multiple) {
      const selected = Array.from(element.selectedOptions).map(opt => opt.value);
      return selected.length > 0 ? selected : undefined;
    }

    const value = element.value;
    return value ? value : undefined;
  }

  /**
   * Restore selected value(s):
   * - single select => select.value = savedValue
   * - multiple select => mark matching options as selected
   */
  writeValue(element, savedValue) {
    if (element.multiple) {
      // Expecting an array
      if (!Array.isArray(savedValue)) return;

      for (const option of element.options) {
        option.selected = savedValue.includes(option.value);
      }
      return;
    }

    // Single select
    if (typeof savedValue === 'string') {
      element.value = savedValue;
    }
  }
}
