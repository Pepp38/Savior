// tests/core/big-form.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import Savior from '../../savior.js';
import { createForm } from '../setup/browser-env.js';

describe('Savior – large form stress test', () => {
  const prefix = 'savior:test:big-form:';
  const saveDelayMs = 400;

  beforeEach(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear();
    }
  });

  it('saves and restores a form with many fields', async () => {
    const fieldsMarkup = Array.from({ length: 50 }, (_, i) => {
      const index = i + 1;
      return `<input type="text" name="field${index}" />`;
    }).join('\n');

    const form = createForm(`
      <form data-savior="big-form">
        ${fieldsMarkup}
      </form>
    `);

    const inputs = Array.from(form.querySelectorAll('input'));

    let result = Savior.init({
      selector: 'form[data-savior]',
      debug: false,
      storageKeyPrefix: prefix,
      saveDelayMs,
    });
    expect(result.ok).toBe(true);
    let core = result.core;

    inputs.forEach((input, index) => {
      input.value = `Value ${index + 1}`;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });

    await new Promise((resolve) => setTimeout(resolve, saveDelayMs + 100));

    if (core && typeof core.destroy === 'function') core.destroy();

    document.body.innerHTML = '';

    const refreshedForm = createForm(`
      <form data-savior="big-form">
        ${fieldsMarkup}
      </form>
    `);

    result = Savior.init({
      selector: 'form[data-savior]',
      debug: false,
      storageKeyPrefix: prefix,
      saveDelayMs,
    });
    expect(result.ok).toBe(true);
    core = result.core;

    const refreshedInputs = Array.from(refreshedForm.querySelectorAll('input'));

    refreshedInputs.forEach((input, index) => {
      expect(input.value).toBe(`Value ${index + 1}`);
    });

    if (core && typeof core.destroy === 'function') core.destroy();
  });
});
