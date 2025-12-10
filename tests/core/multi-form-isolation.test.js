import Savior from '../../savior.js';
import { createForm } from '../setup/browser-env.js';

describe('Savior – multi-form draft isolation', () => {
  const prefix = 'savior:test:multi:';

  it('restores only Form A when only Form A has a draft', async () => {
    // 1) "Première page" : deux formulaires, saisie uniquement dans A
    const formA = createForm(`
      <form data-savior="multi-form-a">
        <input type="email" name="emailA" />
        <textarea name="messageA"></textarea>
      </form>
    `);

    const formB = createForm(`
      <form data-savior="multi-form-b">
        <input type="email" name="emailB" />
        <textarea name="messageB"></textarea>
      </form>
    `);

    let core = Savior.init({
      selector: 'form[data-savior]',
      debug: false,
      storageKeyPrefix: prefix,
    });

    // Saisie uniquement dans A
    const emailA = formA.querySelector('input[name="emailA"]');
    const messageA = formA.querySelector('textarea[name="messageA"]');

    emailA.value = 'user-a@example.com';
    messageA.value = 'Hello from A';

    emailA.dispatchEvent(new Event('input', { bubbles: true }));
    messageA.dispatchEvent(new Event('input', { bubbles: true }));

    // Laisser le debounce (400 ms) jouer
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (core && typeof core.destroy === 'function') {
      core.destroy();
    }

    // 2) "Refresh" : on recrée la page avec des formulaires identiques
    document.body.innerHTML = '';

    const refreshedFormA = createForm(`
      <form data-savior="multi-form-a">
        <input type="email" name="emailA" />
        <textarea name="messageA"></textarea>
      </form>
    `);

    const refreshedFormB = createForm(`
      <form data-savior="multi-form-b">
        <input type="email" name="emailB" />
        <textarea name="messageB"></textarea>
      </form>
    `);

    core = Savior.init({
      selector: 'form[data-savior]',
      debug: false,
      storageKeyPrefix: prefix,
    });

    const restoredEmailA = refreshedFormA.querySelector('input[name="emailA"]');
    const restoredMessageA = refreshedFormA.querySelector('textarea[name="messageA"]');

    const restoredEmailB = refreshedFormB.querySelector('input[name="emailB"]');
    const restoredMessageB = refreshedFormB.querySelector('textarea[name="messageB"]');

    // A doit être restauré
    expect(restoredEmailA.value).toBe('user-a@example.com');
    expect(restoredMessageA.value).toBe('Hello from A');

    // B doit rester vide
    expect(restoredEmailB.value).toBe('');
    expect(restoredMessageB.value).toBe('');

    if (core && typeof core.destroy === 'function') {
      core.destroy();
    }
  });

  it('restores only Form B when only Form B has a draft', async () => {
    // 1) "Première page" : deux formulaires, saisie uniquement dans B
    const formA = createForm(`
      <form data-savior="multi-form-a">
        <input type="email" name="emailA" />
        <textarea name="messageA"></textarea>
      </form>
    `);

    const formB = createForm(`
      <form data-savior="multi-form-b">
        <input type="email" name="emailB" />
        <textarea name="messageB"></textarea>
      </form>
    `);

    let core = Savior.init({
      selector: 'form[data-savior]',
      debug: false,
      storageKeyPrefix: prefix,
    });

    // Saisie uniquement dans B
    const emailB = formB.querySelector('input[name="emailB"]');
    const messageB = formB.querySelector('textarea[name="messageB"]');

    emailB.value = 'user-b@example.com';
    messageB.value = 'Hello from B';

    emailB.dispatchEvent(new Event('input', { bubbles: true }));
    messageB.dispatchEvent(new Event('input', { bubbles: true }));

    await new Promise((resolve) => setTimeout(resolve, 500));

    if (core && typeof core.destroy === 'function') {
      core.destroy();
    }

    // 2) "Refresh"
    document.body.innerHTML = '';

    const refreshedFormA = createForm(`
      <form data-savior="multi-form-a">
        <input type="email" name="emailA" />
        <textarea name="messageA"></textarea>
      </form>
    `);

    const refreshedFormB = createForm(`
      <form data-savior="multi-form-b">
        <input type="email" name="emailB" />
        <textarea name="messageB"></textarea>
      </form>
    `);

    core = Savior.init({
      selector: 'form[data-savior]',
      debug: false,
      storageKeyPrefix: prefix,
    });

    const restoredEmailA = refreshedFormA.querySelector('input[name="emailA"]');
    const restoredMessageA = refreshedFormA.querySelector('textarea[name="messageA"]');

    const restoredEmailB = refreshedFormB.querySelector('input[name="emailB"]');
    const restoredMessageB = refreshedFormB.querySelector('textarea[name="messageB"]');

    // A doit rester vide
    expect(restoredEmailA.value).toBe('');
    expect(restoredMessageA.value).toBe('');

    // B doit être restauré
    expect(restoredEmailB.value).toBe('user-b@example.com');
    expect(restoredMessageB.value).toBe('Hello from B');

    if (core && typeof core.destroy === 'function') {
      core.destroy();
    }
  });

  it('restores each form with its own draft when both forms have data', async () => {
    // 1) "Première page" : deux formulaires, tous les deux remplis
    const formA = createForm(`
      <form data-savior="multi-form-a">
        <input type="email" name="emailA" />
        <textarea name="messageA"></textarea>
      </form>
    `);

    const formB = createForm(`
      <form data-savior="multi-form-b">
        <input type="email" name="emailB" />
        <textarea name="messageB"></textarea>
      </form>
    `);

    let core = Savior.init({
      selector: 'form[data-savior]',
      debug: false,
      storageKeyPrefix: prefix,
    });

    const emailA = formA.querySelector('input[name="emailA"]');
    const messageA = formA.querySelector('textarea[name="messageA"]');
    const emailB = formB.querySelector('input[name="emailB"]');
    const messageB = formB.querySelector('textarea[name="messageB"]');

    emailA.value = 'user-a@example.com';
    messageA.value = 'Message from A';

    emailB.value = 'user-b@example.com';
    messageB.value = 'Message from B';

    emailA.dispatchEvent(new Event('input', { bubbles: true }));
    messageA.dispatchEvent(new Event('input', { bubbles: true }));
    emailB.dispatchEvent(new Event('input', { bubbles: true }));
    messageB.dispatchEvent(new Event('input', { bubbles: true }));

    await new Promise((resolve) => setTimeout(resolve, 500));

    if (core && typeof core.destroy === 'function') {
      core.destroy();
    }

    // 2) "Refresh"
    document.body.innerHTML = '';

    const refreshedFormA = createForm(`
      <form data-savior="multi-form-a">
        <input type="email" name="emailA" />
        <textarea name="messageA"></textarea>
      </form>
    `);

    const refreshedFormB = createForm(`
      <form data-savior="multi-form-b">
        <input type="email" name="emailB" />
        <textarea name="messageB"></textarea>
      </form>
    `);

    core = Savior.init({
      selector: 'form[data-savior]',
      debug: false,
      storageKeyPrefix: prefix,
    });

    const restoredEmailA = refreshedFormA.querySelector('input[name="emailA"]');
    const restoredMessageA = refreshedFormA.querySelector('textarea[name="messageA"]');
    const restoredEmailB = refreshedFormB.querySelector('input[name="emailB"]');
    const restoredMessageB = refreshedFormB.querySelector('textarea[name="messageB"]');

    // Chaque formulaire doit retrouver SON propre brouillon
    expect(restoredEmailA.value).toBe('user-a@example.com');
    expect(restoredMessageA.value).toBe('Message from A');

    expect(restoredEmailB.value).toBe('user-b@example.com');
    expect(restoredMessageB.value).toBe('Message from B');

    if (core && typeof core.destroy === 'function') {
      core.destroy();
    }
  });
});
