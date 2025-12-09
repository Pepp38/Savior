import Savior from '../../savior.js';
import { createForm } from '../setup/browser-env.js';

describe('Savior - corrupted JSON in storage before init', () => {
  it('ignores corrupted drafts and keeps the form stable', () => {
    const formId = 'corrupted-form';
    const prefix = 'savior:test:core:corrupted:';
    const storageKey = `${prefix}${formId}`;

    // Put invalid JSON before Savior is even initialized
    window.localStorage.setItem(storageKey, '{invalid-json');

    const form = createForm(`
      <form data-savior="${formId}">
        <input type="text" name="title" value="default-title" />
      </form>
    `);

    const initFn = () =>
      Savior.init({
        selector: 'form[data-savior]',
        debug: true,
        storageKeyPrefix: prefix,
      });

    // Savior.init must survive corrupted JSON without error
    expect(initFn).not.toThrow();

    // Form must stay intact
    const input = form.querySelector('input[name="title"]');
    expect(input.value).toBe('default-title');
  });
});
