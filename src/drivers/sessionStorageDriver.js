// Default driver using window.sessionStorage for persistence.

// Internal safe JSON parser for driver use
function safeParse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export class SessionStorageDriver {
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
