import Savior from '../../savior.js';
import { createForm } from '../setup/browser-env.js';

function createFlakyDriver() {
  let saveCalls = 0;
  let lastSuccessfulDraft = null;

  return {
    save(formId, draft) {
      saveCalls += 1;

      // Fail intermittently
      if (saveCalls === 1 || saveCalls === 3) {
        throw new Error('Flaky save');
      }

      lastSuccessfulDraft = { formId, draft };
    },
    load() {
      return null;
    },
    clear() {
      // no-op
    },
    _getSaveCalls() {
      return saveCalls;
    },
    _getLastSuccessfulDraft() {
      return lastSuccessfulDraft;
    },
  };
}

describe('Savior - flaky driver (intermittent failures)', () => {
  it('survives save errors and continues saving afterward', async () => {
    const form = createForm(`
      <form data-savior="flaky-form">
        <input type="text" name="title" />
      </form>
    `);

    const flakyDriver = createFlakyDriver();

    const result = Savior.init({
      selector: 'form[data-savior]',
      debug: true,
      driver: flakyDriver,
    });
    expect(result.ok).toBe(true);
    const core = result.core;

    const input = form.querySelector('input[name="title"]');

    // Trigger multiple saves (some will fail)
    for (let i = 0; i < 4; i++) {
      input.value = `value-${i}`;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 450));
    }

    expect(flakyDriver._getSaveCalls()).toBeGreaterThanOrEqual(4);

    const last = flakyDriver._getLastSuccessfulDraft();
    expect(last).not.toBeNull();
    expect(last.draft.fields.title).toMatch(/^value-/);

    if (core && typeof core.destroy === 'function') {
      core.destroy();
    }
  });
});
