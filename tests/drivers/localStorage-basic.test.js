import { LocalStorageDriver } from '../../src/drivers/localStorageDriver.js';

describe('LocalStorageDriver – basic behavior', () => {
  it('saves, loads and clears a draft with prefix', () => {
    const prefix = 'savior:test:driver-basic:';
    const driver = new LocalStorageDriver({
      debug: false,
      storageKeyPrefix: prefix,
    });

    const formId = 'driver-form';
    const draft = {
      formId,
      timestampUtc: '2025-01-01T00:00:00.000Z',
      fields: { title: 'Hello driver' },
    };

    // Save
    driver.save(formId, draft);

    const key = `${prefix}${formId}`;
    const raw = window.localStorage.getItem(key);
    expect(raw).toBeTruthy();

    // Load
    const loaded = driver.load(formId);
    expect(loaded).toBeTruthy();
    expect(loaded.formId).toBe(formId);
    expect(loaded.fields.title).toBe('Hello driver');

    // Clear
    driver.clear(formId);
    expect(window.localStorage.getItem(key)).toBeNull();
  });
});
