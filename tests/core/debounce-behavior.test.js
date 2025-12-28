// tests/core/debounce-behavior.test.js
import { describe, it, expect, vi } from 'vitest';
import Savior from '../../savior.js';
import { createForm } from '../setup/browser-env.js';

describe('Savior – debounce behavior', () => {
  const prefix = 'savior:test:debounce:';
  const saveDelayMs = 400;

  it('calls driver.save only once for multiple rapid input events', async () => {
    vi.useFakeTimers();

    // 1) Formulaire de test
    const form = createForm(`
      <form data-savior="debounce-form">
        <input type="text" name="title" />
      </form>
    `);

    const input = form.querySelector('input[name="title"]');

    // 2) Fake driver avec isSupported() + spy sur save()
    const saveSpy = vi.fn().mockResolvedValue(undefined);

    const fakeDriver = {
      isSupported() {
        return true;
      },
      save(formId, draft) {
        return saveSpy(formId, draft);
      },
      load() {
        return Promise.resolve(null);
      },
      clear() {
        return Promise.resolve();
      },
    };

    const result = Savior.init({
      selector: 'form[data-savior]',
      debug: false,
      storageKeyPrefix: prefix,
      driver: fakeDriver,
      saveDelayMs,
    });
    expect(result.ok).toBe(true);
    const core = result.core;

    // 3) Plusieurs frappes rapides (< saveDelayMs)
    input.value = 'S';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    vi.advanceTimersByTime(100);

    input.value = 'Sa';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    vi.advanceTimersByTime(100);

    input.value = 'Sav';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    vi.advanceTimersByTime(100);

    // On est à 300ms, pas encore atteint le debounce de 400ms
    expect(saveSpy).not.toHaveBeenCalled();

    // 4) On dépasse le délai de debounce
    vi.advanceTimersByTime(200); // total 500ms

    // On laisse Vitest exécuter les timers pendants (dont le debounce)
    await vi.runAllTimersAsync();

    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(saveSpy).toHaveBeenCalledWith(
      expect.stringContaining('debounce-form'),
      expect.objectContaining({
        formId: 'debounce-form',
        fields: expect.any(Object),
      }),
    );

    if (core && typeof core.destroy === 'function') {
      core.destroy();
    }

    vi.useRealTimers();
  });
});
