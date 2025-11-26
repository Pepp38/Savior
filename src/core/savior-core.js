// src/core/savior-core.js

import { getFieldAdapterForElement } from '../fields/FieldAdapterRegistry.js';

// Core autosave logic for Savior.
// Depends on a driver exposing:
//   save(formId, draft),
//   load(formId),
//   clear(formId)

export class SaviorCore {
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

  init() {
    const forms = document.querySelectorAll(this.formSelector);
    this.logDebug(`Initializing on selector "${this.formSelector}", found ${forms.length} form(s).`);
    forms.forEach(formElement => this.attachToForm(formElement));
  }

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

  getFormId(formElement) {
    return (
      formElement.getAttribute('data-savior') ||
      formElement.id ||
      null
    );
  }

  restoreForm(formElement, formId) {
    const storedDraft = this.driver.load(formId);
    if (!storedDraft || !storedDraft.fields) {
      this.logDebug(`No draft found for form "${formId}".`);
      return;
    }

    this.logDebug(`Restoring draft for form "${formId}".`, storedDraft);

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
        this.logDebug(`Saving draft for form "${formId}" (debounced).`);
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

    this.logDebug(`Persisting draft for form "${formId}".`, draft);
    this.driver.save(formId, draft);
  }

  wireSubmitEvent(formElement, formId) {
    formElement.addEventListener('submit', () => {
      this.logDebug(`Clearing draft for form "${formId}" on submit.`);
      this.driver.clear(formId);
    });
  }
}
