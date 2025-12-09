import Savior from '../../savior.js';
import { createForm } from '../setup/browser-env.js';

describe('Savior – password fields are never persisted', () => {
  it('does not store any value for password inputs', async () => {
    const form = createForm(`
      <form data-savior="password-form">
        <input type="text" name="email" />
        <input type="password" name="password" />
      </form>
    `);

    const core = Savior.init({
      selector: 'form[data-savior]',
      debug: false,
      storageKeyPrefix: 'savior:test:password:',
    });

    const emailInput = form.querySelector('input[name="email"]');
    const passwordInput = form.querySelector('input[name="password"]');

    emailInput.value = 'user@example.com';
    passwordInput.value = 'super-secret';

    emailInput.dispatchEvent(new Event('input', { bubbles: true }));
    passwordInput.dispatchEvent(new Event('input', { bubbles: true }));

    await new Promise((resolve) => setTimeout(resolve, 500));

    const key = Object.keys(window.localStorage).find((k) =>
      k.includes('savior:test:password:')
    );
    expect(key).toBeTruthy();

    const raw = window.localStorage.getItem(key);
    const draft = JSON.parse(raw);

    expect(draft.fields.email).toBe('user@example.com');
    // Password field should not be present at all
    expect('password' in draft.fields).toBe(false);

    if (core && typeof core.destroy === 'function') {
      core.destroy();
    }
  });
});
