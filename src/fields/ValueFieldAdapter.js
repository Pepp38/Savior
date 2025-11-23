// src/fields/ValueFieldAdapter.js
import { FieldAdapter } from './FieldAdapter.js';

export class ValueFieldAdapter extends FieldAdapter {
  /**
   * This adapter handles "value-based" input types that are not
   * covered by TextFieldAdapter / CheckboxFieldAdapter / RadioFieldAdapter.
   *
   * Supported types:
   * - number
   * - range
   * - date
   * - time
   * - datetime-local
   * - month
   * - week
   * - color
   */
  canHandle(element) {
    if (!(element instanceof HTMLInputElement)) {
      return false;
    }

    const supportedTypes = [
      'number',
      'range',
      'date',
      'time',
      'datetime-local',
      'month',
      'week',
      'color'
    ];

    return supportedTypes.includes(element.type);
  }

  /**
   * For these inputs, we simply store the string value.
   *
   * @param {HTMLInputElement} element
   * @returns {string}
   */
  readValue(element) {
    return element.value ?? '';
  }

  /**
   * Restore the stored value as-is.
   *
   * @param {HTMLInputElement} element
   * @param {unknown} value
   */
  writeValue(element, value) {
    element.value = typeof value === 'string' ? value : '';
  }
}
