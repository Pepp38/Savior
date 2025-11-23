// src/fields/TextFieldAdapter.js
import { FieldAdapter } from './FieldAdapter.js';

export class TextFieldAdapter extends FieldAdapter {
  /**
   * @param {HTMLElement} element
   * @returns {boolean}
   */
  canHandle(element) {
    if (!(element instanceof HTMLInputElement) && !(element instanceof HTMLTextAreaElement)) {
      return false;
    }

    // TextInput-like types
    const textLikeTypes = [
      'text',
      'search',
      'email',
      'url',
      'tel'
    ];

    // <textarea> has no "type" property worth checking
    if (element instanceof HTMLTextAreaElement) {
      return true;
    }

    // For <input>, type must be one of the text-like ones
    return textLikeTypes.includes(element.type);
  }

  /**
   * @param {HTMLInputElement|HTMLTextAreaElement} element
   * @returns {string}
   */
  readValue(element) {
    return element.value ?? '';
  }

  /**
   * @param {HTMLInputElement|HTMLTextAreaElement} element
   * @param {string} value
   */
  writeValue(element, value) {
    element.value = typeof value === 'string' ? value : '';
  }
}
