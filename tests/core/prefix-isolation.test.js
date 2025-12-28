// tests/core/prefix-isolation.test.js
import { describe, it, expect } from 'vitest';
import Savior from '../../savior.js';
import { createForm } from '../setup/browser-env.js';

describe('Savior – prefix / page isolation', () => {
  const saveDelayMs = 400;

  it('keeps drafts isolated between two different pages even with same prefix', async () => {
    // -------------------------
    // PAGE 1 — SAUVEGARDE
    // -------------------------
    document.body.innerHTML = '';

    const page1Form = createForm(`
      <form data-savior="page-1-form">
        <input type="text" name="value" />
      </form>
    `);

    const page1Input = page1Form.querySelector('input[name="value"]');

    let result = Savior.init({
      selector: 'form[data-savior]',
      debug: false,
      storageKeyPrefix: 'savior:test:prefix:',
      pageId: 'page-1',
      saveDelayMs,
    });

    expect(result.ok).toBe(true);
    let core = result.core;

    page1Input.value = 'Page One Value';
    page1Input.dispatchEvent(new Event('input', { bubbles: true }));

    await new Promise((resolve) => setTimeout(resolve, saveDelayMs + 50));

    if (core && typeof core.destroy === 'function') core.destroy();

    // -------------------------
    // PAGE 2 — SAUVEGARDE
    // -------------------------
    document.body.innerHTML = '';

    const page2Form = createForm(`
      <form data-savior="page-2-form">
        <input type="text" name="value" />
      </form>
    `);

    const page2Input = page2Form.querySelector('input[name="value"]');

    result = Savior.init({
      selector: 'form[data-savior]',
      debug: false,
      storageKeyPrefix: 'savior:test:prefix:',
      pageId: 'page-2',
      saveDelayMs,
    });

    expect(result.ok).toBe(true);
    core = result.core;

    expect(result.ok).toBe(true);
    core = result.core;

    page2Input.value = 'Page Two Value';
    page2Input.dispatchEvent(new Event('input', { bubbles: true }));

    await new Promise((resolve) => setTimeout(resolve, saveDelayMs + 50));

    if (core && typeof core.destroy === 'function') core.destroy();

    // -------------------------
    // REFRESH — PAGE 1 : doit restaurer seulement Page One
    // -------------------------
    document.body.innerHTML = '';

    const refreshedPage1 = createForm(`
      <form data-savior="page-1-form">
        <input type="text" name="value" />
      </form>
    `);

    result = Savior.init({
      selector: 'form[data-savior]',
      debug: false,
      storageKeyPrefix: 'savior:test:prefix:',
      pageId: 'page-1',
      saveDelayMs,
    });
    expect(result.ok).toBe(true);
    core = result.core;

    const r1 = refreshedPage1.querySelector('input[name="value"]');
    expect(r1.value).toBe('Page One Value');

    if (core && typeof core.destroy === 'function') core.destroy();

    // -------------------------
    // REFRESH — PAGE 2 : doit restaurer seulement Page Two
    // -------------------------
    document.body.innerHTML = '';

    const refreshedPage2 = createForm(`
      <form data-savior="page-2-form">
        <input type="text" name="value" />
      </form>
    `);

    result = Savior.init({
      selector: 'form[data-savior]',
      debug: false,
      storageKeyPrefix: 'savior:test:prefix:',
      pageId: 'page-2',
      saveDelayMs,
    });
    expect(result.ok).toBe(true);
    core = result.core;

    const r2 = refreshedPage2.querySelector('input[name="value"]');
    expect(r2.value).toBe('Page Two Value');

    if (core && typeof core.destroy === 'function') core.destroy();
  });
});
