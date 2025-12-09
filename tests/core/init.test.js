import Savior from '../../savior.js';
import { createForm } from '../setup/browser-env.js';

describe('Savior.init basic behavior', () => {
  it('attaches to a simple form and saves a draft on input', async () => {
    const form = createForm(`
      <form data-savior="test-form">
        <input type="text" name="title" />
      </form>
    `);

    const core = Savior.init({
      selector: 'form[data-savior]',
      debug: false,
      storageKeyPrefix: 'savior:test:auto:',
    });

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
});
