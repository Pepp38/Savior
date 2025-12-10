// tests/drivers/sessionStorage-corrupted-json.test.js
import { describe, it, beforeEach, expect } from 'vitest';
import { SessionStorageDriver } from '../../src/drivers/sessionStorageDriver.js';

describe('SessionStorageDriver – corrupted JSON', () => {
  const formId = 'test-form-corrupted';

  beforeEach(() => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.clear();
    }
  });

  function createDriver() {
    // ⬇️ ADAPTE ICI SI NÉCESSAIRE (même logique que dans le test basic)
    return new SessionStorageDriver(window.sessionStorage, 'savior:test:session-corrupted:');
  }

  it('returns null and does not throw when stored value is invalid JSON', async () => {
    const storage = window.sessionStorage;
    const driver = createDriver();

    // 1) Sauvegarde normale pour laisser le driver créer sa clé
    await driver.save(formId, { value: 'ok' });

    // On récupère la clé unique utilisée par le driver
    expect(storage.length).toBe(1);
    const key = storage.key(0);

    // 2) On remplace la valeur par du JSON invalide
    storage.setItem(key, '{this is not valid JSON');

    // 3) On vérifie que load() ne jette pas d’exception et retourne null
    let loaded = null;
    let error = null;

    try {
      loaded = await driver.load(formId);
    } catch (e) {
      error = e;
    }

    expect(error).toBeNull();
    expect(loaded).toBeNull();

    // Optionnel : si ton driver nettoie la clé corrompue, tu peux activer ça
    // expect(storage.getItem(key)).toBeNull();
  });
});
