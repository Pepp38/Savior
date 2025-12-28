import Savior from '../../savior.js';
import { createForm } from '../setup/browser-env.js';

describe('Savior.init basic behavior', () => {
  it('attaches to a simple form and saves a draft on input', async () => {
    const form = createForm(`
      <form data-savior="test-form">
        <input type="text" name="title" />
      </form>
    `);

    const result = Savior.init({
      selector: 'form[data-savior]',
      debug: false,
      storageKeyPrefix: 'savior:test:auto:',
    });
    expect(result.ok).toBe(true);
    const core = result.core;

    const input = form.querySelector('input[name="title"]');
    input.value = 'Hello tests';

    const evt = new Event('input', { bubbles: true });
    input.dispatchEvent(evt);

    await new Promise((resolve) => setTimeout(resolve, 500));

    const key = Object.keys(window.localStorage).find((k) =>
      k.includes('savior:test:auto:')
    );
    expect(key).toBeTruthy();

    const raw = window.localStorage.getItem(key);
    const draft = JSON.parse(raw);

    expect(draft).toBeTruthy();
    expect(draft.formId).toBe('test-form');
    expect(draft.fields.title).toBe('Hello tests');

    if (core && typeof core.destroy === 'function') {
      core.destroy();
    }
  });

  it('initializes with SessionStorageDriver even if localStorage is blocked', async () => {
    const form = createForm(`
      <form data-savior="session-form">
        <input type="text" name="title" />
      </form>
    `);

    const originalSetItem = window.localStorage.setItem;
    window.localStorage.setItem = () => {
      throw new Error('blocked');
    };

    try {
      const driver = new Savior.SessionStorageDriver({
        storageKeyPrefix: 'savior:test:session:',
        debug: false,
      });

      const result = Savior.init({
        selector: 'form[data-savior]',
        debug: false,
        saveDelayMs: 200,
        driver,
      });
      expect(result.ok).toBe(true);
      const core = result.core;

      const input = form.querySelector('input[name="title"]');
      input.value = 'Hello session';
      input.dispatchEvent(new Event('input', { bubbles: true }));

      await new Promise((resolve) => setTimeout(resolve, 300));

      const key = Object.keys(window.sessionStorage).find((k) =>
        k.includes('savior:test:session:')
      );
      expect(key).toBeTruthy();

      const raw = window.sessionStorage.getItem(key);
      const draft = JSON.parse(raw);
      expect(draft.fields.title).toBe('Hello session');

      if (core && typeof core.destroy === 'function') core.destroy();
    } finally {
      window.localStorage.setItem = originalSetItem;
    }
  });
});
