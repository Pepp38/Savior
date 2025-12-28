import Savior from '../../savior.js';
import { createForm } from '../setup/browser-env.js';

describe('Savior – checkbox group ambiguity handling', () => {
  const saveDelayMs = 200;

  it('restores checkbox groups using unique values when available', async () => {
    const prefix = 'savior:test:cbg:value:';

    let form = createForm(`
      <form data-savior="cbg-form">
        <input type="checkbox" name="interests" value="a" />
        <input type="checkbox" name="interests" value="b" />
        <input type="checkbox" name="interests" value="c" />
      </form>
    `);

    let result = Savior.init({ selector: 'form[data-savior]', debug: false, storageKeyPrefix: prefix, saveDelayMs });
    expect(result.ok).toBe(true);
    let core = result.core;

    const boxes = form.querySelectorAll('input[name="interests"]');
    boxes[1].checked = true;
    boxes[1].dispatchEvent(new Event('change', { bubbles: true }));

    await new Promise((r) => setTimeout(r, saveDelayMs + 50));
    core.destroy();

    document.body.innerHTML = '';

    form = createForm(`
      <form data-savior="cbg-form">
        <input type="checkbox" name="interests" value="a" />
        <input type="checkbox" name="interests" value="b" />
        <input type="checkbox" name="interests" value="c" />
      </form>
    `);

    result = Savior.init({ selector: 'form[data-savior]', debug: false, storageKeyPrefix: prefix, saveDelayMs });
    expect(result.ok).toBe(true);
    core = result.core;

    const restored = form.querySelectorAll('input[name="interests"]');
    expect(restored[0].checked).toBe(false);
    expect(restored[1].checked).toBe(true);
    expect(restored[2].checked).toBe(false);

    core.destroy();
  });

  it('restores checkbox groups using ids when values are not usable', async () => {
    const prefix = 'savior:test:cbg:id:';

    let form = createForm(`
      <form data-savior="cbg-form">
        <input type="checkbox" name="interests" id="x" />
        <input type="checkbox" name="interests" id="y" />
        <input type="checkbox" name="interests" id="z" />
      </form>
    `);

    let result = Savior.init({ selector: 'form[data-savior]', debug: false, storageKeyPrefix: prefix, saveDelayMs });
    expect(result.ok).toBe(true);
    let core = result.core;

    const boxes = form.querySelectorAll('input[name="interests"]');
    boxes[1].checked = true;
    boxes[1].dispatchEvent(new Event('change', { bubbles: true }));

    await new Promise((r) => setTimeout(r, saveDelayMs + 50));
    core.destroy();

    document.body.innerHTML = '';

    form = createForm(`
      <form data-savior="cbg-form">
        <input type="checkbox" name="interests" id="x" />
        <input type="checkbox" name="interests" id="y" />
        <input type="checkbox" name="interests" id="z" />
      </form>
    `);

    result = Savior.init({ selector: 'form[data-savior]', debug: false, storageKeyPrefix: prefix, saveDelayMs });
    expect(result.ok).toBe(true);
    core = result.core;

    const restored = form.querySelectorAll('input[name="interests"]');
    expect(restored[0].checked).toBe(false);
    expect(restored[1].checked).toBe(true);
    expect(restored[2].checked).toBe(false);

    core.destroy();
  });

  it('restores checkbox groups using index fallback when values and ids are not usable', async () => {
    const prefix = 'savior:test:cbg:index:';

    let form = createForm(`
      <form data-savior="cbg-form">
        <input type="checkbox" name="interests" />
        <input type="checkbox" name="interests" />
        <input type="checkbox" name="interests" />
      </form>
    `);

    let result = Savior.init({ selector: 'form[data-savior]', debug: false, storageKeyPrefix: prefix, saveDelayMs });
    expect(result.ok).toBe(true);
    let core = result.core;

    const boxes = form.querySelectorAll('input[name="interests"]');
    boxes[2].checked = true;
    boxes[2].dispatchEvent(new Event('change', { bubbles: true }));

    await new Promise((r) => setTimeout(r, saveDelayMs + 50));
    core.destroy();

    document.body.innerHTML = '';

    form = createForm(`
      <form data-savior="cbg-form">
        <input type="checkbox" name="interests" />
        <input type="checkbox" name="interests" />
        <input type="checkbox" name="interests" />
      </form>
    `);

    result = Savior.init({ selector: 'form[data-savior]', debug: false, storageKeyPrefix: prefix, saveDelayMs });
    expect(result.ok).toBe(true);
    core = result.core;

    const restored = form.querySelectorAll('input[name="interests"]');
    expect(restored[0].checked).toBe(false);
    expect(restored[1].checked).toBe(false);
    expect(restored[2].checked).toBe(true);

    core.destroy();
  });
});
