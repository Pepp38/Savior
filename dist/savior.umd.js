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
     * Also supports checkbox groups saved as string[] (same name):
     *   - value is an array of selected checkbox values
     *   - each checkbox is checked if its value is included
     *
     * @param {HTMLInputElement} element
     * @param {unknown} value
     */
    writeValue(element, value) {
      // Checkbox groups are restored group-aware in SaviorCore.
      // If someone bypasses that logic, do nothing rather than applying partial state.
      if (value && typeof value === 'object' && value.__type === 'checkboxGroup') {
        return;
      }

      if (Array.isArray(value)) {
        const v = element.value ?? 'on';
        element.checked = value.includes(v);
        return;
      }

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

      // Behavior flags
      this.clearOnSubmit = options.clearOnSubmit ?? true;
      this.restoreOn = options.restoreOn === 'manual' ? 'manual' : 'init';
      this.maxAgeMs =
        typeof options.maxAgeMs === 'number' && Number.isFinite(options.maxAgeMs)
          ? options.maxAgeMs
          : undefined;

      // Pending-clear behavior (conservative: never clear immediately on submit)
      this._pendingClearByFormId = new Set();
      this._lifecycleHandlersBound = false;
      this._onPageHide = null;
      this._onVisibilityChange = null;

      // Lifecycle bookkeeping
      this._bindingsByForm = new Map();
      this._lastSerializedByFormId = new Map();
    }

    _ensureLifecycleHandlers() {
      if (this._lifecycleHandlersBound) return;
      this._lifecycleHandlersBound = true;

      this._onPageHide = () => this._flushPendingClears('pagehide');
      this._onVisibilityChange = () => {
        try {
          if (document.visibilityState === 'hidden') {
            this._flushPendingClears('visibilitychange:hidden');
          }
        } catch {
          // ignore
        }
      };

      try {
        window.addEventListener('pagehide', this._onPageHide);
      } catch {
        // ignore
      }
      try {
        document.addEventListener('visibilitychange', this._onVisibilityChange);
      } catch {
        // ignore
      }
    }

    _flushPendingClears(trigger) {
      if (!this._pendingClearByFormId || this._pendingClearByFormId.size === 0) {
        return;
      }

      for (const formId of this._pendingClearByFormId) {
        this.logDebug(`Clearing draft for form "${formId}" on ${trigger}.`);
        try {
          this.driver.clear(formId);
        } catch (err) {
          this.logWarn(
            `Driver.clear failed for form "${formId}":`,
            err?.message || err
          );
        }
      }

      this._pendingClearByFormId.clear();
    }

    _determineCheckboxGroupMode(group) {
      const values = group.map((cb) => cb.value ?? 'on');
      const valuesAreUsable =
        values.every((v) => typeof v === 'string' && v.length > 0) &&
        new Set(values).size === group.length &&
        !(new Set(values).size === 1 && values[0] === 'on');

      if (valuesAreUsable) return 'value';

      const ids = group.map((cb) => cb.id).filter(Boolean);
      const idsAreUsable = ids.length === group.length && new Set(ids).size === group.length;
      if (idsAreUsable) return 'id';

      return 'index';
    }

    _buildCheckboxGroupPayload(group, mode) {
      if (mode === 'value') {
        const selected = [];
        for (const cb of group) if (cb.checked) selected.push(cb.value ?? 'on');
        return { __type: 'checkboxGroup', mode: 'value', selected };
      }

      if (mode === 'id') {
        const selected = [];
        for (const cb of group) if (cb.checked) selected.push(cb.id);
        return { __type: 'checkboxGroup', mode: 'id', selected };
      }

      // mode: index
      const selected = [];
      for (let idx = 0; idx < group.length; idx++) {
        if (group[idx].checked) selected.push(idx);
      }
      return { __type: 'checkboxGroup', mode: 'index', selected };
    }

    _restoreCheckboxGroup(group, savedValue, fieldName) {
      // Legacy format: string[] of values (works only when values are meaningful)
      if (Array.isArray(savedValue)) {
        for (const cb of group) {
          const v = cb.value ?? 'on';
          cb.checked = savedValue.includes(v);
        }
        return { restored: true, mode: 'legacy' };
      }

      // New format
      if (!savedValue || savedValue.__type !== 'checkboxGroup') {
        return { restored: false };
      }

      const { mode, selected } = savedValue;
      if (!Array.isArray(selected)) {
        return { restored: false };
      }

      if (mode === 'value') {
        for (const cb of group) {
          const v = cb.value ?? 'on';
          cb.checked = selected.includes(v);
        }
        return { restored: true, mode: 'value' };
      }

      if (mode === 'id') {
        for (const cb of group) {
          cb.checked = selected.includes(cb.id);
        }
        return { restored: true, mode: 'id' };
      }

      if (mode === 'index') {
        for (let idx = 0; idx < group.length; idx++) {
          group[idx].checked = selected.includes(idx);
        }
        this.logDebug(
          `Checkbox group "${fieldName}" restored using index fallback (ambiguous config).`
        );
        return { restored: true, mode: 'index' };
      }

      return { restored: false };
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
      if (this.restoreOn !== 'manual') {
        this.restoreForm(formElement, formId);
      }

      // Ensure idempotency if attachToForm is called multiple times
      if (this._bindingsByForm.has(formId)) {
        this.logWarn(`Form "${formId}" is already attached. Skipping re-attach.`);
        return;
      }

      const bindings = this._wireEvents(formElement, formId);
      this._bindingsByForm.set(formId, bindings);
    }

    /**
     * Restore drafts for all attached forms.
     * Useful for dynamic forms (frameworks) where fields are not present at init.
     * Fail-soft by design.
     */
    restore() {
      for (const [formId, bindings] of this._bindingsByForm.entries()) {
        try {
          this.restoreForm(bindings.formElement, formId);
        } catch {
          // ignore
        }
      }
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

      // Optional TTL: ignore stale drafts (do NOT auto-clear)
      if (typeof this.maxAgeMs === 'number') {
        const ts = storedDraft.timestampUtc;
        const parsed = typeof ts === 'string' ? Date.parse(ts) : NaN;
        if (Number.isFinite(parsed)) {
          const ageMs = Date.now() - parsed;
          if (ageMs > this.maxAgeMs) {
            this.logDebug(
              `Draft for form "${formId}" ignored (stale: ${ageMs}ms > ${this.maxAgeMs}ms).`
            );
            return;
          }
        }
      }

      this.logDebug(`Restoring draft for form "${formId}".`, storedDraft);

      const elements = formElement.elements;
      if (!elements || !elements.length) {
        return;
      }

      // Pre-index checkbox groups (same name) for group-aware restoration
      const checkboxGroupsByName = new Map();
      for (let i = 0; i < elements.length; i++) {
        const el = elements[i];
        if (!el?.name) continue;
        if (el instanceof HTMLInputElement && el.type === 'checkbox') {
          const group = checkboxGroupsByName.get(el.name) ?? [];
          group.push(el);
          checkboxGroupsByName.set(el.name, group);
        }
      }
      const handledCheckboxGroupNames = new Set();

      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        const fieldName = element.name;
        if (!fieldName) continue;

        if (!(fieldName in storedDraft.fields)) continue;

        // Checkbox group support (same name)
        if (element instanceof HTMLInputElement && element.type === 'checkbox') {
          const group = checkboxGroupsByName.get(fieldName);
          if (group && group.length > 1) {
            if (handledCheckboxGroupNames.has(fieldName)) {
              continue;
            }
            handledCheckboxGroupNames.add(fieldName);

            const savedValue = storedDraft.fields[fieldName];
            try {
              this._restoreCheckboxGroup(group, savedValue, fieldName);
            } catch (err) {
              this.logWarn(
                `Checkbox group restore failed for field "${fieldName}" in form "${formId}":`,
                err?.message || err
              );
            }
            continue;
          }
        }

        const adapter = getFieldAdapterForElement(element);
        if (!adapter) continue;

        const savedValue = storedDraft.fields[fieldName];
        try {
          adapter.writeValue(element, savedValue);
        } catch (err) {
          this.logWarn(
            `Adapter.writeValue failed for field "${fieldName}" in form "${formId}":`,
            err?.message || err
          );
          continue;
        }
      }
    }

    /**
     * Wire input/change events to trigger debounced autosave.
     * @param {HTMLFormElement} formElement
     * @param {string} formId
     */
    _wireEvents(formElement, formId) {
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

      const onSubmit = (event) => {
        if (!this.clearOnSubmit) return;

        // defaultPrevented may be set by another listener after ours.
        // Using a microtask ensures we observe the final state.
        const enqueue = typeof queueMicrotask === 'function'
          ? queueMicrotask
          : (cb) => Promise.resolve().then(cb);

        enqueue(() => {
          if (event?.defaultPrevented) {
            this.logDebug(`Submit prevented for form "${formId}"; draft not cleared.`);
            return;
          }

          this.logDebug(`Submit detected for form "${formId}"; marking pendingClear.`);
          this._pendingClearByFormId.add(formId);
          this._ensureLifecycleHandlers();
        });
      };

      formElement.addEventListener('input', scheduleSave);
      formElement.addEventListener('change', scheduleSave);
      formElement.addEventListener('submit', onSubmit);

      return { formElement, scheduleSave, onSubmit, getSaveTimeoutId: () => saveTimeoutId };
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

      // Pre-index checkbox groups (same name)
      const checkboxGroupsByName = new Map();
      for (let i = 0; i < elements.length; i++) {
        const el = elements[i];
        if (!el?.name) continue;
        if (el instanceof HTMLInputElement && el.type === 'checkbox') {
          const group = checkboxGroupsByName.get(el.name) ?? [];
          group.push(el);
          checkboxGroupsByName.set(el.name, group);
        }
      }
      const handledCheckboxGroupNames = new Set();

      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        const fieldName = element.name;
        if (!fieldName) continue;

        // Do not persist passwords.
        if (element.type === 'password') continue;

        // Checkbox group support (same name)
        if (element instanceof HTMLInputElement && element.type === 'checkbox') {
          const group = checkboxGroupsByName.get(fieldName);
          if (group && group.length > 1) {
            if (handledCheckboxGroupNames.has(fieldName)) {
              continue;
            }
            handledCheckboxGroupNames.add(fieldName);

            const mode = this._determineCheckboxGroupMode(group);
            if (mode !== 'value') {
              this.logDebug(
                `Checkbox group "${fieldName}" saved using ${mode} mode (fallback).`
              );
            }
            const payload = this._buildCheckboxGroupPayload(group, mode);
            fields[fieldName] = payload;
            continue;
          }
        }

        const adapter = getFieldAdapterForElement(element);
        if (!adapter) continue;

        let value;
        try {
          value = adapter.readValue(element);
        } catch (err) {
          this.logWarn(
            `Adapter.readValue failed for field "${fieldName}" in form "${formId}":`,
            err?.message || err
          );
          continue;
        }

        // Convention: undefined = "nothing to save" (e.g. unchecked radio).
        if (value === undefined) continue;

        fields[fieldName] = value;
      }

      const draft = {
        formId,
        timestampUtc: new Date().toISOString(),
        fields
      };

      // Skip identical writes (micro-optimization)
      let serialized = '';
      try {
        serialized = JSON.stringify(draft);
      } catch (err) {
        // If serialization fails (very rare), fall back to attempting driver.save.
        this.logWarn(`Draft serialization failed for form "${formId}":`, err?.message || err);
      }

      if (serialized) {
        const last = this._lastSerializedByFormId.get(formId);
        if (last === serialized) {
          this.logDebug(`Skipping save for form "${formId}" (draft unchanged).`);
          return;
        }
        this._lastSerializedByFormId.set(formId, serialized);
      }

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
     * Detach all listeners and clean internal state.
     * Idempotent.
     */
    destroy() {
      for (const [formId, binding] of this._bindingsByForm.entries()) {
        const { formElement, scheduleSave, onSubmit, getSaveTimeoutId } = binding;
        try {
          formElement.removeEventListener('input', scheduleSave);
          formElement.removeEventListener('change', scheduleSave);
          formElement.removeEventListener('submit', onSubmit);
        } catch {
          // ignore
        }

        const timeoutId = typeof getSaveTimeoutId === 'function' ? getSaveTimeoutId() : null;
        if (timeoutId !== null) {
          try {
            clearTimeout(timeoutId);
          } catch {
            // ignore
          }
        }

        this._lastSerializedByFormId.delete(formId);
      }

      this._bindingsByForm.clear();

      // Global lifecycle listeners (pagehide / visibilitychange)
      if (this._lifecycleHandlersBound) {
        try {
          window.removeEventListener('pagehide', this._onPageHide);
        } catch {
          // ignore
        }
        try {
          document.removeEventListener('visibilitychange', this._onVisibilityChange);
        } catch {
          // ignore
        }

        this._lifecycleHandlersBound = false;
        this._onPageHide = null;
        this._onVisibilityChange = null;
      }

      try {
        this._pendingClearByFormId?.clear?.();
      } catch {
        // ignore
      }
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
      console.warn('[Savior]', ...args);
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
      console.warn('[Savior]', ...args);
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
    clearOnSubmit: true,
    restoreOn: 'init',
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
   * Returns the driver that will actually be used, based on provided options.
   * The goal is to make "support" checks reflect reality (driver chosen),
   * not just localStorage availability.
   */
  function getEffectiveDriver(options = {}) {
    const effectiveOptions = {
      ...DEFAULT_OPTIONS,
      ...options,
    };
    return effectiveOptions.driver || createDefaultDriver(effectiveOptions);
  }

  /**
   * Log de debug centralisé.
   * Ne produit rien tant que debug === false.
   */
  function logDebug(options, ...args) {
    if (!options?.debug) return;
    console.debug('[Savior]', ...args);
  }

  function logWarn(options, ...args) {
    if (!options?.debug) return;
    console.warn('[Savior]', ...args);
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

    // clearOnSubmit
    merged.clearOnSubmit = merged.clearOnSubmit !== false;

    // restoreOn
    if (merged.restoreOn !== 'manual') {
      merged.restoreOn = 'init';
    }

    // maxAgeMs (optional)
    if (merged.maxAgeMs !== undefined) {
      if (
        typeof merged.maxAgeMs !== 'number' ||
        !Number.isFinite(merged.maxAgeMs) ||
        merged.maxAgeMs < 0
      ) {
        warn('Invalid "maxAgeMs" option. Disabling TTL.');
        delete merged.maxAgeMs;
      }
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
    checkSupport(driverOrOptions) {
      // If a driver is provided, trust its own availability flag when present.
      const looksLikeDriver =
        driverOrOptions &&
        typeof driverOrOptions === 'object' &&
        typeof driverOrOptions.save === 'function' &&
        typeof driverOrOptions.load === 'function' &&
        typeof driverOrOptions.clear === 'function';

      if (looksLikeDriver) {
        if (typeof driverOrOptions.isStorageAvailable === 'boolean') {
          return driverOrOptions.isStorageAvailable;
        }
        return true;
      }

      if (driverOrOptions && typeof driverOrOptions === 'object') {
        const driver = getEffectiveDriver(driverOrOptions);
        if (typeof driver.isStorageAvailable === 'boolean') {
          return driver.isStorageAvailable;
        }
        return true;
      }

      // Default behavior (LocalStorageDriver)
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
      const normalized = normalizeInitOptions(options);
      const driver = getEffectiveDriver(normalized);

      // Driver availability (prefer driver's own flag when present)
      const isDriverAvailable =
        typeof driver?.isStorageAvailable === 'boolean' ? driver.isStorageAvailable : Savior.checkSupport(driver);

      if (!isDriverAvailable) {
        logWarn(normalized, 'Driver not available; init aborted.');
        return { ok: false, reason: 'storage_unavailable' };
      }

      // Ensure we have a usable selector and at least one form
      let forms = [];
      try {
        forms = Array.from(document.querySelectorAll(normalized.selector));
      } catch (err) {
        logWarn(normalized, 'Invalid selector or unsupported environment; init aborted.');
        return { ok: false, reason: 'unsupported_environment' };
      }

      if (forms.length === 0) {
        logDebug(normalized, 'No forms found for selector', normalized.selector);
        return { ok: false, reason: 'no_forms_found' };
      }

      const core = new SaviorCore({ ...normalized, driver });
      logDebug(normalized, 'Calling core.init() with selector', normalized.selector);
      core.init();
      return { ok: true, core };
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
      const driver = getEffectiveDriver(options);
      if (!Savior.checkSupport(driver)) return null;
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
      const driver = getEffectiveDriver(options);
      if (!Savior.checkSupport(driver)) return;
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
