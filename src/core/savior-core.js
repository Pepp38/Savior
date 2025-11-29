// src/core/savior-core.js

import { getFieldAdapterForElement } from '../fields/FieldAdapterRegistry.js';

// Core autosave logic for Savior.
//
// Depends on a driver exposing:
//   - save(formId, draft)
//   - load(formId)
//   - clear(formId)
//
// draft schema:
// {
//   formId: string,
//   timestampUtc: string, // ISO 8601
//   fields: {
//     [fieldName: string]: unknown
//   }
// }

export class SaviorCore {
  /**
   * @param {Object} options
   * @param {string} [options.selector='form[data-savior]'] CSS selector used to find forms.
   * @param {Object} options.driver Storage driver (must implement save/load/clear).
   * @param {number} [options.saveDelayMs=400] Debounce delay in ms for autosave.
   * @param {boolean} [options.debug=false] Enable debug logs in console.
   */
  constructor(options) {
    this.formSelector = options.selector || 'form[data-savior]';
    this.driver = options.driver;
    this.saveDelayMs = options.saveDelayMs ?? 400;
    this.debug = options.debug ?? false;
  }

  logDebug(...args) {
    if (!this.debug) return;
    console.log('[Savior]', ...args);
  }

  logWarn(...args) {
    if (!this.debug) return;
    console.warn('[Savior]', ...args);
  }

  /**
   * Discover all target forms and attach autosave wiring.
   */
  init() {
    const forms = document.querySelectorAll(this.formSelector);
    this.logDebug(
      `Initializing on selector "${this.formSelector}", found ${forms.length} form(s).`
    );

    if (!this.driver) {
      this.logWarn(
        'No driver provided to SaviorCore. Initialization will be skipped.'
      );
      return;
    }

    forms.forEach((formElement) => this.attachToForm(formElement));
  }

  /**
   * Attach autosave + restore + clear behavior to a single form.
   * @param {HTMLFormElement} formElement
   */
  attachToForm(formElement) {
    const formId = this.getFormId(formElement);
    if (!formId) {
      this.logWarn('Form without data-savior or id — skipping.', formElement);
      return;
    }

    this.logDebug(`Attaching to form "${formId}".`);
    this.restoreForm(formElement, formId);
    this.wireInputEvents(formElement, formId);
    this.wireSubmitEvent(formElement, formId);
  }

  /**
   * Derive a stable identifier for the form.
   * Priority: data-savior > id > null.
   * @param {HTMLFormElement} formElement
   * @returns {string|null}
   */
  getFormId(formElement) {
    return (
      formElement.getAttribute('data-savior') ||
      formElement.id ||
      null
    );
  }

  /**
   * Restore a saved draft (if any) into all compatible fields of the form.
   * @param {HTMLFormElement} formElement
   * @param {string} formId
   */
  restoreForm(formElement, formId) {
    const storedDraft = this.driver.load(formId);
    if (!storedDraft || !storedDraft.fields) {
      this.logDebug(`No draft found for form "${formId}".`);
      return;
    }

    this.logDebug(`Restoring draft for form "${formId}".`, storedDraft);

    const elements = formElement.elements;
    if (!elements || !elements.length) {
      return;
    }

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

  /**
   * Wire input/change events to trigger debounced autosave.
   * @param {HTMLFormElement} formElement
   * @param {string} formId
   */
  wireInputEvents(formElement, formId) {
    let saveTimeoutId = null;

    const scheduleSave = () => {
      if (saveTimeoutId !== null) {
        clearTimeout(saveTimeoutId);
      }

      saveTimeoutId = setTimeout(() => {
        this.logDebug(`Saving draft for form "${formId}" (debounced).`);
        this.saveForm(formElement, formId);
        saveTimeoutId = null;
      }, this.saveDelayMs);
    };

    formElement.addEventListener('input', scheduleSave);
    formElement.addEventListener('change', scheduleSave);
  }

  /**
   * Collect current values from all supported fields and persist the draft.
   * @param {HTMLFormElement} formElement
   * @param {string} formId
   */
  saveForm(formElement, formId) {
    const fields = {};
    const elements = formElement.elements;

    if (!elements || !elements.length) {
      return;
    }

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      const fieldName = element.name;
      if (!fieldName) continue;

      // Do not persist passwords.
      if (element.type === 'password') continue;

      const adapter = getFieldAdapterForElement(element);
      if (!adapter) continue;

      const value = adapter.readValue(element);

      // Convention: undefined = "nothing to save" (e.g. unchecked radio).
      if (value === undefined) continue;

      fields[fieldName] = value;
    }

    const draft = {
      formId,
      timestampUtc: new Date().toISOString(),
      fields
    };

    this.logDebug(`Persisting draft for form "${formId}".`, draft);
    this.driver.save(formId, draft);
  }

  /**
   * On submit, clear the stored draft for this form.
   * @param {HTMLFormElement} formElement
   * @param {string} formId
   */
  wireSubmitEvent(formElement, formId) {
    formElement.addEventListener('submit', () => {
      this.logDebug(`Clearing draft for form "${formId}" on submit.`);
      this.driver.clear(formId);
    });
  }
}
