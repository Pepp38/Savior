(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Savior = factory());
})(this, (function () { 'use strict';

  // src/fields/FieldAdapter.js

  /**
   * Base contract for all field adapters.
   * Each adapter decides if it can handle a given element,
   * and knows how to read/write the field value.
   */
  class FieldAdapter {
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

  // src/fields/TextFieldAdapter.js

  class TextFieldAdapter extends FieldAdapter {
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

  // src/fields/CheckboxFieldAdapter.js

  class CheckboxFieldAdapter extends FieldAdapter {
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

  // src/fields/RadioFieldAdapter.js

  class RadioFieldAdapter extends FieldAdapter {
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

  // src/fields/SelectFieldAdapter.js

  class SelectFieldAdapter extends FieldAdapter {

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

  // src/fields/ValueFieldAdapter.js

  class ValueFieldAdapter extends FieldAdapter {
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

  // src/fields/FieldAdapterRegistry.js

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
  function getFieldAdapterForElement(element, adapters = defaultAdapters) {
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

  // src/core/savior-core.js


  // Core autosave logic for Savior.
  // Depends on a driver exposing:
  //   save(formId, draft),
  //   load(formId),
  //   clear(formId)

  class SaviorCore {
    constructor(options) {
      this.formSelector = options.selector || 'form[data-savior]';
      this.driver = options.driver;
      this.saveDelayMs = options.saveDelayMs || 400;
    }

    init() {
      const forms = document.querySelectorAll(this.formSelector);
      forms.forEach(formElement => this.attachToForm(formElement));
    }

    attachToForm(formElement) {
      const formId = this.getFormId(formElement);
      if (!formId) {
        console.warn('[Savior] Form without data-savior or id — skipping.', formElement);
        return;
      }

      this.restoreForm(formElement, formId);
      this.wireInputEvents(formElement, formId);
      this.wireSubmitEvent(formElement, formId);
    }

    getFormId(formElement) {
      return (
        formElement.getAttribute('data-savior') ||
        formElement.id ||
        null
      );
    }

    restoreForm(formElement, formId) {
      const storedDraft = this.driver.load(formId);
      if (!storedDraft || !storedDraft.fields) return;

      const elements = formElement.elements;

      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        const fieldName = element.name;
        if (!fieldName) continue;

        if (!(fieldName in storedDraft.fields)) continue;

        const adapter = getFieldAdapterForElement(element);
        if (!adapter) continue;

        const savedValue = storedDraft.fields[fieldName];
        adapter.writeValue(element, savedValue);
      }
    }

    wireInputEvents(formElement, formId) {
      let saveTimeoutId = null;

      const scheduleSave = () => {
        if (saveTimeoutId !== null) {
          clearTimeout(saveTimeoutId);
        }

        saveTimeoutId = setTimeout(() => {
          this.saveForm(formElement, formId);
          saveTimeoutId = null;
        }, this.saveDelayMs);
      };

      formElement.addEventListener('input', scheduleSave);
      formElement.addEventListener('change', scheduleSave);
    }

    saveForm(formElement, formId) {
      const fields = {};
      const elements = formElement.elements;

      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        const fieldName = element.name;
        if (!fieldName) continue;

        // On ne sauvegarde pas les mots de passe
        if (element.type === 'password') continue;

        const adapter = getFieldAdapterForElement(element);
        if (!adapter) continue;

        const value = adapter.readValue(element);

        // Convention: undefined = "rien à sauver" (utile pour les radios non cochées)
        if (value === undefined) {
          continue;
        }

        fields[fieldName] = value;
      }

      const draft = {
        formId,
        timestampUtc: new Date().toISOString(),
        fields
      };

      this.driver.save(formId, draft);
    }

    wireSubmitEvent(formElement, formId) {
      formElement.addEventListener('submit', () => {
        this.driver.clear(formId);
      });
    }
  }

  // Default driver using window.localStorage for persistence.

  class LocalStorageDriver {
    constructor(options = {}) {
      this.storageKeyPrefix = options.storageKeyPrefix || 'savior_draft_';
      this.isStorageAvailable = this.checkStorageAvailable();
    }

    checkStorageAvailable() {
      try {
        const testKey = '__savior_test__';
        window.localStorage.setItem(testKey, '1');
        window.localStorage.removeItem(testKey);
        return true;
      } catch (error) {
        console.warn('[Savior] localStorage not available:', error);
        return false;
      }
    }

    getStorageKey(formId) {
      return this.storageKeyPrefix + formId;
    }

    save(formId, draft) {
      if (!this.isStorageAvailable) return;
      try {
        const serializedDraft = JSON.stringify(draft);
        window.localStorage.setItem(this.getStorageKey(formId), serializedDraft);
      } catch (error) {
        console.warn('[Savior] Failed to save draft:', error);
      }
    }

    load(formId) {
      if (!this.isStorageAvailable) return null;
      try {
        const raw = window.localStorage.getItem(this.getStorageKey(formId));
        if (!raw) return null;
        return JSON.parse(raw);
      } catch (error) {
        console.warn('[Savior] Failed to load draft:', error);
        return null;
      }
    }

    clear(formId) {
      if (!this.isStorageAvailable) return;
      try {
        window.localStorage.removeItem(this.getStorageKey(formId));
      } catch (error) {
        console.warn('[Savior] Failed to clear draft:', error);
      }
    }
  }

  const Savior = {
    /**
     * Initialise Savior sur les formulaires ciblés.
     * @param {Object} options
     * @param {string} [options.selector] - Sélecteur des formulaires à protéger.
     * @param {number} [options.saveDelayMs] - Délai avant save (debounce).
     * @param {LocalStorageDriver} [options.driver] - Driver de stockage.
     */
    init(options = {}) {
      const driver = options.driver || new LocalStorageDriver();

      const core = new SaviorCore({
        ...options,
        driver
      });

      core.init();
      return core;
    },

    LocalStorageDriver
  };

  return Savior;

}));
//# sourceMappingURL=savior.umd.js.map
