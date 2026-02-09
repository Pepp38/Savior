import { MemoryDriver } from '../../src/drivers/memoryDriver.js';

describe('MemoryDriver – isolation', () => {
  it('does not collide across different prefixes', () => {
    const formId = 'shared-form-id';
    const draftA = { formId, fields: { value: 'A' } };
    const draftB = { formId, fields: { value: 'B' } };

    const driverA = new MemoryDriver({
      debug: false,
      storageKeyPrefix: 'savior:test:memory:isolation:A:',
    });

    const driverB = new MemoryDriver({
      debug: false,
      storageKeyPrefix: 'savior:test:memory:isolation:B:',
    });

    driverA.save(formId, draftA);
    driverB.save(formId, draftB);

    expect(driverA.load(formId).fields.value).toBe('A');
    expect(driverB.load(formId).fields.value).toBe('B');
  });

  it('is isolated by instance by default', () => {
    const formId = 'same-prefix';
    const prefix = 'savior:test:memory:instance:';

    const driver1 = new MemoryDriver({ debug: false, storageKeyPrefix: prefix });
    const driver2 = new MemoryDriver({ debug: false, storageKeyPrefix: prefix });

    driver1.save(formId, { formId, fields: { value: 123 } });

    expect(driver1.load(formId)).toBeTruthy();
    expect(driver2.load(formId)).toBeNull();
  });
});
