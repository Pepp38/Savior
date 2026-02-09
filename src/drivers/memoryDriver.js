// In-memory driver (no persistence).
// Stores drafts in the current JS runtime only.

export class MemoryDriver {
  constructor(options = {}) {
    this.storageKeyPrefix = options.storageKeyPrefix || 'savior_memory_draft_';
    this.debug = options.debug ?? false;

    // In-memory is always "available" when JS runs.
    this.isStorageAvailable = true;

    // Each driver instance keeps its own store.
    // That is intentional: isolation by instance is a safe default.
    this._draftByKey = new Map();
  }

  /**
   * Centralizes key generation.
   * Format: prefix + formId
   */
  getStorageKey(formId) {
    return `${this.storageKeyPrefix}${formId}`;
  }

  logWarn(...args) {
    if (!this.debug) return;
    console.warn('[Savior]', ...args);
  }

  save(formId, draft) {
    try {
      if (!formId) return;
      this._draftByKey.set(this.getStorageKey(formId), draft);
    } catch (error) {
      this.logWarn('Failed to save draft in memory:', error);
    }
  }

  load(formId) {
    try {
      if (!formId) return null;
      return this._draftByKey.get(this.getStorageKey(formId)) ?? null;
    } catch (error) {
      this.logWarn('Failed to load draft from memory:', error);
      return null;
    }
  }

  clear(formId) {
    try {
      if (!formId) return;
      this._draftByKey.delete(this.getStorageKey(formId));
    } catch (error) {
      this.logWarn('Failed to clear draft from memory:', error);
    }
  }
}
