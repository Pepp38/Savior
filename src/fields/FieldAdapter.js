// src/fields/FieldAdapter.js

/**
 * Base contract for all field adapters.
 * Each adapter decides if it can handle a given element,
 * and knows how to read/write the field value.
 */
export class FieldAdapter {
  /**
   * @param {HTMLElement} element
   * @returns {boolean}
   */
  canHandle(element) {
    return false;
  }

  /**
   * @param {HTMLElement} element
   * @returns {unknown}
   */
  readValue(element) {
    throw new Error('readValue() not implemented');
  }

  /**
   * @param {HTMLElement} element
   * @param {unknown} value
   */
  writeValue(element, value) {
    throw new Error('writeValue() not implemented');
  }
}
