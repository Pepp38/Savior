import { MemoryDriver } from '../../src/drivers/memoryDriver.js';

describe('MemoryDriver – basic behavior', () => {
  it('saves, loads and clears a draft with prefix', () => {
    const prefix = 'savior:test:memory-basic:';
    const driver = new MemoryDriver({
      debug: false,
      storageKeyPrefix: prefix,
    });

    const formId = 'driver-form';
    const draft = {
      formId,
      timestampUtc: '2025-01-01T00:00:00.000Z',
      fields: { title: 'Hello memory' },
    };

    driver.save(formId, draft);

    const loaded = driver.load(formId);
    expect(loaded).toBeTruthy();
    expect(loaded.formId).toBe(formId);
    expect(loaded.fields.title).toBe('Hello memory');

    driver.clear(formId);
    expect(driver.load(formId)).toBeNull();
  });
});
