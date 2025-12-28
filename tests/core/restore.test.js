import Savior from '../../savior.js';
import { createForm } from '../setup/browser-env.js';

describe('Savior.restore basic behavior', () => {
  it('restores a saved draft after a simulated refresh', async () => {
    // 1) First "page load": create form + init + type + save
    let form = createForm(`
      <form data-savior="test-form">
        <input type="text" name="title" />
        <textarea name="message"></textarea>
      </form>
    `);

    let result = Savior.init({
      selector: 'form[data-savior]',
      debug: false,
      storageKeyPrefix: 'savior:test:restore:',
    });
    expect(result.ok).toBe(true);
    let core = result.core;

    const titleInput = form.querySelector('input[name="title"]');
    const messageTextarea = form.querySelector('textarea[name="message"]');

    titleInput.value = 'Hello world';
    messageTextarea.value = 'This is a saved message.';

    titleInput.dispatchEvent(new Event('input', { bubbles: true }));
    messageTextarea.dispatchEvent(new Event('input', { bubbles: true }));

    await new Promise((resolve) => setTimeout(resolve, 500));

    // Optionnel: nettoyer l’instance courante
    if (core && typeof core.destroy === 'function') {
      core.destroy();
    }

    // 2) Simuler un "refresh": reset DOM, recréer un form identique, ré-appeler Savior.init
    document.body.innerHTML = '';

    form = createForm(`
      <form data-savior="test-form">
        <input type="text" name="title" />
        <textarea name="message"></textarea>
      </form>
    `);

    result = Savior.init({
      selector: 'form[data-savior]',
      debug: false,
      storageKeyPrefix: 'savior:test:restore:',
    });

    expect(result.ok).toBe(true);
    core = result.core;

    expect(result.ok).toBe(true);
    core = result.core;

    const restoredTitle = form.querySelector('input[name="title"]');
    const restoredMessage = form.querySelector('textarea[name="message"]');

    // 3) Assert: the values should have been restored from storage
    expect(restoredTitle.value).toBe('Hello world');
    expect(restoredMessage.value).toBe('This is a saved message.');

    if (core && typeof core.destroy === 'function') {
      core.destroy();
    }
  });
});
