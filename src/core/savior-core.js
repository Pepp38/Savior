// Core logic for Savior (debounce, tracking fields, restore, etc.)
// Storage mechanism will be provided via a driver.
// Core autosave logic for Savior.
// Depends on a driver exposing: save(formId, draft), load(formId), clear(formId).

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
      console.warn('[Savior] Form without data-savior or id, skipping.', formElement);
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
    for (let index = 0; index < elements.length; index++) {
      const element = elements[index];
      const fieldName = element.name;
      if (!fieldName) continue;

      if (Object.prototype.hasOwnProperty.call(storedDraft.fields, fieldName)) {
        element.value = storedDraft.fields[fieldName];
      }
    }
  }

  wireInputEvents(formElement, formId) {
    let saveTimeoutId = null;

    const scheduleSave = () => {
      if (saveTimeoutId !== null) {
        window.clearTimeout(saveTimeoutId);
      }

      saveTimeoutId = window.setTimeout(() => {
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

    for (let index = 0; index < elements.length; index++) {
      const element = elements[index];
      const fieldName = element.name;
      if (!fieldName) continue;

      // On ne sauvegarde pas les mots de passe
      if (element.type === 'password') continue;

      fields[fieldName] = element.value;
    }

    const draft = {
      formId: formId,
      timestampUtc: new Date().toISOString(),
      fields: fields
    };

    this.driver.save(formId, draft);
  }

  wireSubmitEvent(formElement, formId) {
    formElement.addEventListener('submit', () => {
      this.driver.clear(formId);
    });
  }
}
