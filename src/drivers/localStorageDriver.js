// Default driver using window.localStorage for persistence.

export class LocalStorageDriver {
  constructor(options = {}) {
    this.storageKeyPrefix = options.storageKeyPrefix || 'savior_draft_';
    this.isStorageAvailable = this.checkStorageAvailable();
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
