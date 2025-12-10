// tests/drivers/sessionStorage-basic.test.js
import { describe, it, beforeEach, expect } from 'vitest';
import { SessionStorageDriver } from '../../src/drivers/sessionStorageDriver.js';

describe('SessionStorageDriver – basic behavior', () => {
  const formId = 'test-form-basic';

  beforeEach(() => {
    // Reset sessionStorage between tests to avoid interference
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.clear();
    }
  });

  function createDriver() {
    // ⬇️ ADAPTE ICI SI NÉCESSAIRE
    // Si ton constructeur est différent, c’est la seule ligne à modifier.
    return new SessionStorageDriver(window.sessionStorage, 'savior:test:session-basic:');
  }

  it('saves and loads a simple draft object', async () => {
    const driver = createDriver();
    const draft = {
      name: 'Alice',
      email: 'alice@example.com',
      counter: 3,
    };

    await driver.save(formId, draft);
    const loaded = await driver.load(formId);

    expect(loaded).toEqual(draft);
  });

  it('overwrites previous draft on save', async () => {
    const driver = createDriver();

    const firstDraft = { value: 'first' };
    const secondDraft = { value: 'second', extra: 42 };

    await driver.save(formId, firstDraft);
    await driver.save(formId, secondDraft);

    const loaded = await driver.load(formId);

    expect(loaded).toEqual(secondDraft);
  });

  it('clears the draft for a given formId', async () => {
    const driver = createDriver();
    const draft = { value: 'to be cleared' };

    await driver.save(formId, draft);

    let loaded = await driver.load(formId);
    expect(loaded).toEqual(draft);

    await driver.clear(formId);

    loaded = await driver.load(formId);
    expect(loaded).toBeNull();
  });
});
