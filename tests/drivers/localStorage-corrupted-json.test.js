import { LocalStorageDriver } from '../../src/drivers/localStorageDriver.js';

describe('LocalStorageDriver - corrupted JSON', () => {
  it('returns null and does not throw when stored value is invalid JSON', () => {
    const prefix = 'savior:test:driver-corrupted:';
    const driver = new LocalStorageDriver({
      debug: false,
      storageKeyPrefix: prefix,
    });

    const formId = 'form-corrupted';
    const key = `${prefix}${formId}`;

    // Insert invalid JSON in storage
    window.localStorage.setItem(key, '{not-valid-json');

    // load must not throw
    const fn = () => driver.load(formId);
    expect(fn).not.toThrow();

    // The result must be null
    const result = driver.load(formId);
    expect(result).toBeNull();
  });
});
