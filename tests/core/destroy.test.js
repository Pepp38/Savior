import { describe, it, expect } from 'vitest';
import Savior from '../../savior.js';
import { createForm } from '../setup/browser-env.js';

describe('SaviorCore.destroy lifecycle', () => {
  it('detaches listeners and becomes idempotent', async () => {
    const prefix = 'savior:test:destroy:';

    const form = createForm(`
      <form data-savior="destroy-form">
        <input type="text" name="title" />
      </form>
    `);

    const result = Savior.init({
      selector: 'form[data-savior]',
      debug: false,
      storageKeyPrefix: prefix,
      saveDelayMs: 200,
    });
    expect(result.ok).toBe(true);
    const core = result.core;

    const input = form.querySelector('input[name="title"]');
    input.value = 'Before destroy';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 260));

    const key = Object.keys(window.localStorage).find((k) => k.includes(prefix));
    expect(key).toBeTruthy();
    const before = window.localStorage.getItem(key);
    expect(before).toBeTruthy();

    core.destroy();
    // Idempotent
    core.destroy();

    // Further input should not write
    input.value = 'After destroy';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 260));

    const after = window.localStorage.getItem(key);
    expect(after).toBe(before);

    // Submit should not clear
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await Promise.resolve();
    expect(window.localStorage.getItem(key)).toBe(before);
  });
});
