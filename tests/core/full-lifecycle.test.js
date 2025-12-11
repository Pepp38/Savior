// tests/core/full-lifecycle.test.js
import { describe, it, expect } from 'vitest';
import Savior from '../../savior.js';
import { createForm } from '../setup/browser-env.js';

describe('Savior – full lifecycle (save, restore, edit, resave, restore)', () => {
  const prefix = 'savior:test:lifecycle:';
  const saveDelayMs = 400;

  it('overwrites previous drafts and keeps cleared fields empty after a second save', async () => {
    // -------------------------
    // SESSION 1 – V1
    // -------------------------
    const formV1 = createForm(`
      <form data-savior="lifecycle-form">
        <input type="text" name="title" />
        <textarea name="body"></textarea>
      </form>
    `);

    const titleV1 = formV1.querySelector('input[name="title"]');
    const bodyV1 = formV1.querySelector('textarea[name="body"]');

    let core = Savior.init({
      selector: 'form[data-savior]',
      debug: false,
      storageKeyPrefix: prefix,
      saveDelayMs,
    });

    titleV1.value = 'First title';
    bodyV1.value = 'First body';
    titleV1.dispatchEvent(new Event('input', { bubbles: true }));
    bodyV1.dispatchEvent(new Event('input', { bubbles: true }));

    await new Promise((resolve) => setTimeout(resolve, saveDelayMs + 50));

    if (core && typeof core.destroy === 'function') core.destroy();

    // -------------------------
    // SESSION 2 – RESTORE V1, puis V2 (dont un champ vidé)
    // -------------------------
    document.body.innerHTML = '';

    const formV2 = createForm(`
      <form data-savior="lifecycle-form">
        <input type="text" name="title" />
        <textarea name="body"></textarea>
      </form>
    `);

    core = Savior.init({
      selector: 'form[data-savior]',
      debug: false,
      storageKeyPrefix: prefix,
      saveDelayMs,
    });

    const titleRestoredV1 = formV2.querySelector('input[name="title"]');
    const bodyRestoredV1 = formV2.querySelector('textarea[name="body"]');

    // V1 doit être restaurée
    expect(titleRestoredV1.value).toBe('First title');
    expect(bodyRestoredV1.value).toBe('First body');

    // On édite : title devient vide, body devient "Second body"
    titleRestoredV1.value = '';
    bodyRestoredV1.value = 'Second body';

    titleRestoredV1.dispatchEvent(new Event('input', { bubbles: true }));
    bodyRestoredV1.dispatchEvent(new Event('input', { bubbles: true }));

    await new Promise((resolve) => setTimeout(resolve, saveDelayMs + 50));

    if (core && typeof core.destroy === 'function') core.destroy();

    // -------------------------
    // SESSION 3 – RESTORE V2
    // -------------------------
    document.body.innerHTML = '';

    const formFinal = createForm(`
      <form data-savior="lifecycle-form">
        <input type="text" name="title" />
        <textarea name="body"></textarea>
      </form>
    `);

    core = Savior.init({
      selector: 'form[data-savior]',
      debug: false,
      storageKeyPrefix: prefix,
      saveDelayMs,
    });

    const finalTitle = formFinal.querySelector('input[name="title"]');
    const finalBody = formFinal.querySelector('textarea[name="body"]');

    // La dernière version doit gagner :
    // - title vidé reste vide
    // - body reflète la deuxième version
    expect(finalTitle.value).toBe('');
    expect(finalBody.value).toBe('Second body');

    if (core && typeof core.destroy === 'function') core.destroy();
  });
});
