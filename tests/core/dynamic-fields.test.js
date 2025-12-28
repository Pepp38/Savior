// tests/core/dynamic-fields.test.js
import { describe, it, expect } from 'vitest';
import Savior from '../../savior.js';
import { createForm } from '../setup/browser-env.js';

describe('Savior – dynamic fields', () => {
  const prefix = 'savior:test:dynamic:';
  const saveDelayMs = 400;

  it('restores a field that was added dynamically after init', async () => {
    // 1) Première "page" : formulaire sans le champ extra
    const form = createForm(`
      <form data-savior="dynamic-form-add">
        <input type="text" name="title" />
      </form>
    `);

    const titleInput = form.querySelector('input[name="title"]');

    let result = Savior.init({
      selector: 'form[data-savior]',
      debug: false,
      storageKeyPrefix: prefix,
      saveDelayMs,
    });

    expect(result.ok).toBe(true);
    let core = result.core;

    // 2) Ajout dynamique d'un champ après init
    const extraInput = document.createElement('input');
    extraInput.name = 'extra';
    extraInput.type = 'text';
    form.appendChild(extraInput);

    titleInput.value = 'Dynamic title';
    extraInput.value = 'Dynamic extra';

    titleInput.dispatchEvent(new Event('input', { bubbles: true }));
    extraInput.dispatchEvent(new Event('input', { bubbles: true }));

    // Laisser le debounce jouer
    await new Promise((resolve) => setTimeout(resolve, saveDelayMs + 100));

    if (core && typeof core.destroy === 'function') {
      core.destroy();
    }

    // 3) "Refresh" : on recrée la page avec les deux champs
    document.body.innerHTML = '';

    const refreshedForm = createForm(`
      <form data-savior="dynamic-form-add">
        <input type="text" name="title" />
        <input type="text" name="extra" />
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

    expect(result.ok).toBe(true);
    core = result.core;

    const restoredTitle = refreshedForm.querySelector('input[name="title"]');
    const restoredExtra = refreshedForm.querySelector('input[name="extra"]');

    expect(restoredTitle.value).toBe('Dynamic title');
    expect(restoredExtra.value).toBe('Dynamic extra');

    if (core && typeof core.destroy === 'function') {
      core.destroy();
    }
  });

  it('restores only existing fields when some saved fields are missing after refresh', async () => {
    // 1) Première "page" : formulaire avec trois champs
    const form = createForm(`
      <form data-savior="dynamic-form-remove">
        <input type="text" name="fieldA" />
        <input type="text" name="fieldB" />
        <input type="text" name="fieldC" />
      </form>
    `);

    const fieldA = form.querySelector('input[name="fieldA"]');
    const fieldB = form.querySelector('input[name="fieldB"]');
    const fieldC = form.querySelector('input[name="fieldC"]');

    let result = Savior.init({
      selector: 'form[data-savior]',
      debug: false,
      storageKeyPrefix: prefix,
      saveDelayMs,
    });

    expect(result.ok).toBe(true);
    let core = result.core;

    fieldA.value = 'Value A';
    fieldB.value = 'Value B';
    fieldC.value = 'Value C';

    fieldA.dispatchEvent(new Event('input', { bubbles: true }));
    fieldB.dispatchEvent(new Event('input', { bubbles: true }));
    fieldC.dispatchEvent(new Event('input', { bubbles: true }));

    await new Promise((resolve) => setTimeout(resolve, saveDelayMs + 100));

    if (core && typeof core.destroy === 'function') {
      core.destroy();
    }

    // 2) "Refresh" : page recréée sans fieldC
    document.body.innerHTML = '';

    const refreshedForm = createForm(`
      <form data-savior="dynamic-form-remove">
        <input type="text" name="fieldA" />
        <input type="text" name="fieldB" />
      </form>
    `);

    result = Savior.init({
      selector: 'form[data-savior]',
      debug: false,
      storageKeyPrefix: prefix,
      saveDelayMs,
    });

    const restoredA = refreshedForm.querySelector('input[name="fieldA"]');
    const restoredB = refreshedForm.querySelector('input[name="fieldB"]');
    const missingC = refreshedForm.querySelector('input[name="fieldC"]');

    expect(restoredA.value).toBe('Value A');
    expect(restoredB.value).toBe('Value B');
    expect(missingC).toBeNull();

    if (core && typeof core.destroy === 'function') {
      core.destroy();
    }
  });
});
