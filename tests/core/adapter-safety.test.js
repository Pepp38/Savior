import { describe, it, expect, vi } from 'vitest';
import { createForm } from '../setup/browser-env.js';

// Mock FieldAdapterRegistry so we can force an adapter throwing on specific fields,
// while keeping real behavior for other fields.
vi.mock('../../src/fields/FieldAdapterRegistry.js', async () => {
  const actual = await vi.importActual('../../src/fields/FieldAdapterRegistry.js');

  const throwingAdapter = {
    canHandle() {
      return true;
    },
    readValue() {
      throw new Error('readValue boom');
    },
    writeValue() {
      throw new Error('writeValue boom');
    },
  };

  return {
    ...actual,
    getFieldAdapterForElement(element, adapters) {
      if (element?.name === 'bad') return throwingAdapter;
      return actual.getFieldAdapterForElement(element, adapters);
    },
  };
});

describe('Savior – adapter safety (no unhandled exceptions)', () => {
  it('skips fields whose adapter.readValue throws and continues saving others', async () => {
    const Savior = (await import('../../savior.js')).default;

    const prefix = 'savior:test:adapter-safety:save:';
    const form = createForm(`
      <form data-savior="adapter-safety-save">
        <input type="text" name="good" />
        <input type="text" name="bad" />
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

    const good = form.querySelector('input[name="good"]');
    const bad = form.querySelector('input[name="bad"]');
    good.value = 'ok';
    bad.value = 'nope';

    good.dispatchEvent(new Event('input', { bubbles: true }));
    bad.dispatchEvent(new Event('input', { bubbles: true }));

    await new Promise((r) => setTimeout(r, 260));

    const key = Object.keys(window.localStorage).find((k) => k.includes(prefix));
    expect(key).toBeTruthy();

    const draft = JSON.parse(window.localStorage.getItem(key));
    expect(draft.fields.good).toBe('ok');
    expect(draft.fields.bad).toBeUndefined();

    if (core && typeof core.destroy === 'function') core.destroy();
  });

  it('skips fields whose adapter.writeValue throws and continues restoring others', async () => {
    const Savior = (await import('../../savior.js')).default;

    const prefix = 'savior:test:adapter-safety:restore:';

    // Seed a draft manually with a field that will throw on restore
    const formId = 'adapter-safety-restore';
    const storageKey = `${prefix}${formId}`;
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        formId,
        timestampUtc: new Date().toISOString(),
        fields: { good: 'restored', bad: 'should-not-crash' },
      })
    );

    const form = createForm(`
      <form data-savior="${formId}">
        <input type="text" name="good" />
        <input type="text" name="bad" />
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

    const good = form.querySelector('input[name="good"]');
    const bad = form.querySelector('input[name="bad"]');

    expect(good.value).toBe('restored');
    // bad adapter throws, so it should remain default
    expect(bad.value).toBe('');

    if (core && typeof core.destroy === 'function') core.destroy();
  });
});
