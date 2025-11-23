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
