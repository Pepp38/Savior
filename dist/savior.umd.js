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

  class SaviorCore {
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
      warn(...args);
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
      let storedDraft = null;
      try {
        storedDraft = this.driver.load(formId);
      } catch (err) {
        this.logWarn(`Driver.load failed for form "${formId}":`, err?.message || err);
        return; // ne pas tenter de restore
      }

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
      try {
        this.driver.save(formId, draft);
      } catch (err) {
        this.logWarn(
          `Driver.save failed for form "${formId}":`,
          err?.message || err
        );
      }
    }

    /**
     * On submit, clear the stored draft for this form.
     * @param {HTMLFormElement} formElement
     * @param {string} formId
     */
    wireSubmitEvent(formElement, formId) {
      formElement.addEventListener('submit', () => {
        this.logDebug(`Clearing draft for form "${formId}" on submit.`);
        try {
          this.driver.clear(formId);
        } catch (err) {
          this.logWarn(
            `Driver.clear failed for form "${formId}":`,
            err?.message || err
          );
        }
      });
    }
  }

  // Default driver using window.localStorage for persistence.

  // Internal safe JSON parser for driver use
  function safeParse$1(raw) {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  class LocalStorageDriver {
    constructor(options = {}) {
      this.storageKeyPrefix = options.storageKeyPrefix || 'savior_draft_';
      this.debug = options.debug ?? false;
      this.isStorageAvailable = this.checkStorageAvailable();
    }

    /**
     * Centralise la génération de la clé de storage.
     * Format: prefix + formId
     * Exemple: "savior_draft_form-contact"
     */
    getStorageKey(formId) {
      return `${this.storageKeyPrefix}${formId}`;
    }

    logWarn(...args) {
      if (!this.debug) return;
      warn(...args);
    }

    checkStorageAvailable() {
      try {
        if (typeof window === 'undefined' || !window.localStorage) {
          return false;
        }

        const testKey = '__savior_test__';
        window.localStorage.setItem(testKey, '1');
        window.localStorage.removeItem(testKey);
        return true;
      } catch (error) {
        this.logWarn('localStorage not available:', error);
        return false;
      }
    }

    save(formId, draft) {
      if (!this.isStorageAvailable) return;

      try {
        const serializedDraft = JSON.stringify(draft);
        window.localStorage.setItem(this.getStorageKey(formId), serializedDraft);
      } catch (error) {
        this.logWarn('Failed to save draft:', error);
      }
    }

    load(formId) {
      if (!this.isStorageAvailable) return null;

      try {
        const raw = window.localStorage.getItem(this.getStorageKey(formId));
        if (!raw) return null;

        return safeParse$1(raw);
      } catch (error) {
        this.logWarn('Failed to load draft:', error);
        return null;
      }
    }

    clear(formId) {
      if (!this.isStorageAvailable) return;

      try {
        window.localStorage.removeItem(this.getStorageKey(formId));
      } catch (error) {
        this.logWarn('Failed to clear draft:', error);
      }
    }
  }

  // Default driver using window.sessionStorage for persistence.

  // Internal safe JSON parser for driver use
  function safeParse(raw) {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  class SessionStorageDriver {
    constructor(options = {}) {
      this.storageKeyPrefix = options.storageKeyPrefix || 'savior_session_draft_';
      this.debug = options.debug ?? false;
      this.isStorageAvailable = this.checkStorageAvailable();
    }

    /**
     * Centralise la génération de la clé de storage.
     * Format: prefix + formId
     * Exemple: "savior_session_draft_form-contact"
     */
    getStorageKey(formId) {
      return `${this.storageKeyPrefix}${formId}`;
    }

    logWarn(...args) {
      if (!this.debug) return;
      warn(...args);
    }

    checkStorageAvailable() {
      try {
        if (typeof window === 'undefined' || !window.sessionStorage) {
          return false;
        }

        const testKey = '__savior_session_test__';
        window.sessionStorage.setItem(testKey, '1');
        window.sessionStorage.removeItem(testKey);
        return true;
      } catch (error) {
        this.logWarn('sessionStorage not available:', error);
        return false;
      }
    }

    save(formId, draft) {
      if (!this.isStorageAvailable) return;

      try {
        const serializedDraft = JSON.stringify(draft);
        window.sessionStorage.setItem(this.getStorageKey(formId), serializedDraft);
      } catch (error) {
        this.logWarn('Failed to save draft to sessionStorage:', error);
      }
    }

    load(formId) {
      if (!this.isStorageAvailable) return null;

      try {
        const raw = window.sessionStorage.getItem(this.getStorageKey(formId));
        if (!raw) return null;

        return safeParse(raw);
      } catch (error) {
        this.logWarn('Failed to load draft from sessionStorage:', error);
        return null;
      }
    }

    clear(formId) {
      if (!this.isStorageAvailable) return;

      try {
        window.sessionStorage.removeItem(this.getStorageKey(formId));
      } catch (error) {
        this.logWarn('Failed to clear draft from sessionStorage:', error);
      }
    }
  }

  const DEFAULT_OPTIONS = {
    selector: 'form[data-savior]',
    saveDelayMs: 400,
    debug: false,
    storageKeyPrefix: 'savior:',
  };

  /**
   * Vérifie si localStorage est utilisable dans cet environnement.
   * Utilisé par checkSupport et les helpers publics.
   */
  function isLocalStorageSupported() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }

      const testKey = '__savior_support_test__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Log de debug centralisé.
   * Ne produit rien tant que debug === false.
   */
  function logDebug(options, ...args) {
    if (!options?.debug) return;
    console.debug('[Savior]', ...args);
  }

  /**
   * Fusionne options utilisateur et valeurs par défaut,
   * avec une validation légère.
   */
  function normalizeInitOptions(userOptions = {}) {
    const merged = {
      ...DEFAULT_OPTIONS,
      ...userOptions,
    };


    merged.debug = merged.debug === true;

    const warn = (...args) => {
      if (merged.debug !== true) return;
      console.warn('[Savior]', ...args);
    };

    // selector
    if (typeof merged.selector !== 'string' || !merged.selector.trim()) {
      warn('Invalid "selector" option. Falling back to default:',
        DEFAULT_OPTIONS.selector
      );
      merged.selector = DEFAULT_OPTIONS.selector;
    }

    // saveDelayMs
    if (
      typeof merged.saveDelayMs !== 'number' ||
      !Number.isFinite(merged.saveDelayMs) ||
      merged.saveDelayMs < 0
    ) {
      warn('Invalid "saveDelayMs" option. Using default:',
        DEFAULT_OPTIONS.saveDelayMs
      );
      merged.saveDelayMs = DEFAULT_OPTIONS.saveDelayMs;
    }
    // storageKeyPrefix
    if (typeof merged.storageKeyPrefix !== 'string') {
      warn('Invalid "storageKeyPrefix" option. Using default:',
        DEFAULT_OPTIONS.storageKeyPrefix
      );
      merged.storageKeyPrefix = DEFAULT_OPTIONS.storageKeyPrefix;
    }

    return merged;
  }

  /**
   * Crée le driver par défaut (LocalStorageDriver) avec des options cohérentes.
   */
  function createDefaultDriver(options = {}) {
    return new LocalStorageDriver({
      debug: Boolean(options.debug),
      storageKeyPrefix: options.storageKeyPrefix ?? DEFAULT_OPTIONS.storageKeyPrefix,
    });
  }

  const Savior = {
    /**
     * Vérifie si l'environnement supporte les APIs nécessaires.
     * @returns {boolean}
     */
    checkSupport() {
      return isLocalStorageSupported();
    },

    /**
     * Initialise Savior sur les formulaires ciblés.
     *
     * Flow:
     * 1. Vérifie le support du storage (checkSupport).
     * 2. Normalise les options avec defaults + validation légère.
     * 3. Choisit un driver (par défaut: LocalStorageDriver).
     * 4. Crée un SaviorCore, appelle core.init().
     * 5. Retourne l'instance de core (avec destroy, etc.).
     *
     * @param {Object} options
     * @param {string} [options.selector]
     * @param {number} [options.saveDelayMs]
     * @param {LocalStorageDriver|SessionStorageDriver} [options.driver]
     * @param {boolean} [options.debug]
     * @param {string} [options.storageKeyPrefix]
     * @returns {SaviorCore|null}
     */
    init(options = {}) {
      if (!Savior.checkSupport()) {
        if (options.debug) {
          warn('Environment does not support required storage APIs. Initialization skipped.'
          );
        }
        return null;
      }

      const normalized = normalizeInitOptions(options);
      const driver = normalized.driver || createDefaultDriver(normalized);

      const core = new SaviorCore({
        ...normalized,
        driver,
      });

      logDebug(normalized, 'Calling core.init() with selector', normalized.selector);
      core.init();
      return core;
    },

    /**
     * Récupère le draft brut pour un formId donné (ou null si absent / non supporté).
     * @param {string} formId
     * @param {Object} [options]
     * @param {LocalStorageDriver|SessionStorageDriver} [options.driver]
     * @param {boolean} [options.debug]
     * @param {string} [options.storageKeyPrefix]
     * @returns {Object|null}
     */
    getDraft(formId, options = {}) {
      if (!formId) return null;
      if (!Savior.checkSupport()) return null;

      const effectiveOptions = {
        ...DEFAULT_OPTIONS,
        ...options,
      };

      const driver = effectiveOptions.driver || createDefaultDriver(effectiveOptions);
      return driver.load(formId);
    },

    /**
     * Efface le draft pour un formId donné.
     * @param {string} formId
     * @param {Object} [options]
     * @param {LocalStorageDriver|SessionStorageDriver} [options.driver]
     * @param {boolean} [options.debug]
     * @param {string} [options.storageKeyPrefix]
     */
    clearDraft(formId, options = {}) {
      if (!formId) return;
      if (!Savior.checkSupport()) return;

      const effectiveOptions = {
        ...DEFAULT_OPTIONS,
        ...options,
      };

      const driver = effectiveOptions.driver || createDefaultDriver(effectiveOptions);
      driver.clear(formId);
    },

    /**
     * Exporte le draft sous forme de JSON pretty-printé (string) ou null.
     * @param {string} formId
     * @param {Object} [options]
     * @returns {string|null}
     */
    exportDraft(formId, options = {}) {
      const draft = Savior.getDraft(formId, options);
      return draft ? JSON.stringify(draft, null, 2) : null;
    },

    LocalStorageDriver,
    SessionStorageDriver,
  };

  return Savior;

}));
//# sourceMappingURL=savior.umd.js.map
