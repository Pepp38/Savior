import Savior from '../../savior.js';
import { createForm } from '../setup/browser-env.js';

describe('Savior – clear on submit', () => {
  it('clears the stored draft when the form is submitted', async () => {
    const form = createForm(`
      <form data-savior="t02-form">
        <input type="text" name="title" />
      </form>
    `);

    const result = Savior.init({
      selector: 'form[data-savior]',
      debug: false,
      storageKeyPrefix: 'savior:test:t02:',
    });
    expect(result.ok).toBe(true);
    const core = result.core;

    const input = form.querySelector('input[name="title"]');
    input.value = 'Will be cleared';

    input.dispatchEvent(new Event('input', { bubbles: true }));

    // Wait for debounced save
    await new Promise((resolve) => setTimeout(resolve, 500));

    // There should be a draft before submit
    const key = Object.keys(window.localStorage).find((k) =>
      k.includes('savior:test:t02:')
    );
    expect(key).toBeTruthy();
    expect(window.localStorage.getItem(key)).toBeTruthy();

    // Submit the form (does not clear immediately)
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    // Pending clear is set in a microtask
    await Promise.resolve();

    // Draft should still exist while the page is active
    expect(window.localStorage.getItem(key)).toBeTruthy();

    // Clear happens on page exit
    window.dispatchEvent(new Event('pagehide'));
    expect(window.localStorage.getItem(key)).toBeNull();

    if (core && typeof core.destroy === 'function') {
      core.destroy();
    }
  });

  it('does NOT clear the draft when submit is prevented', async () => {
    const form = createForm(`
      <form data-savior="t02-form-prevent">
        <input type="text" name="title" />
      </form>
    `);

    // Another listener prevents default (SPA-style submit)
    form.addEventListener('submit', (e) => e.preventDefault());

    const result = Savior.init({
      selector: 'form[data-savior]',
      debug: false,
      storageKeyPrefix: 'savior:test:t02:prevent:',
    });
    expect(result.ok).toBe(true);
    const core = result.core;

    const input = form.querySelector('input[name="title"]');
    input.value = 'Should stay';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 500));

    const key = Object.keys(window.localStorage).find((k) =>
      k.includes('savior:test:t02:prevent:')
    );
    expect(key).toBeTruthy();
    expect(window.localStorage.getItem(key)).toBeTruthy();

    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await Promise.resolve();

    // Even on page exit, prevented submit should not clear
    window.dispatchEvent(new Event('pagehide'));
    expect(window.localStorage.getItem(key)).toBeTruthy();

    if (core && typeof core.destroy === 'function') {
      core.destroy();
    }
  });

  it('does NOT clear the draft when clearOnSubmit is false', async () => {
    const form = createForm(`
      <form data-savior="t02-form-no-clear">
        <input type="text" name="title" />
      </form>
    `);

    const result = Savior.init({
      selector: 'form[data-savior]',
      debug: false,
      storageKeyPrefix: 'savior:test:t02:no-clear:',
      clearOnSubmit: false,
    });
    expect(result.ok).toBe(true);
    const core = result.core;

    const input = form.querySelector('input[name="title"]');
    input.value = 'Should stay';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 500));

    const key = Object.keys(window.localStorage).find((k) =>
      k.includes('savior:test:t02:no-clear:')
    );
    expect(key).toBeTruthy();
    expect(window.localStorage.getItem(key)).toBeTruthy();

    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await Promise.resolve();
    window.dispatchEvent(new Event('pagehide'));

    expect(window.localStorage.getItem(key)).toBeTruthy();

    if (core && typeof core.destroy === 'function') {
      core.destroy();
    }
  });
});
