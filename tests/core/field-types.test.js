// tests/core/field-types.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import Savior from '../../savior.js';
import { createForm } from '../setup/browser-env.js';

describe('Savior – field types (checkbox, radio, select)', () => {
  const prefix = 'savior:test:field-types:';
  const saveDelayMs = 400;

  beforeEach(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear();
    }
  });

  it('restores checkbox checked state correctly', async () => {
    const form = createForm(`
      <form data-savior="checkbox-form">
        <input type="checkbox" name="acceptTerms" />
        <input type="checkbox" name="subscribeNewsletter" />
      </form>
    `);

    const accept = form.querySelector('input[name="acceptTerms"]');
    const subscribe = form.querySelector('input[name="subscribeNewsletter"]');

    let result = Savior.init({
      selector: 'form[data-savior]',
      debug: false,
      storageKeyPrefix: prefix,
      saveDelayMs,
    });
    expect(result.ok).toBe(true);
    let core = result.core;

    accept.checked = true;
    subscribe.checked = false;

    accept.dispatchEvent(new Event('change', { bubbles: true }));
    subscribe.dispatchEvent(new Event('change', { bubbles: true }));

    await new Promise((resolve) => setTimeout(resolve, saveDelayMs + 50));

    if (core && typeof core.destroy === 'function') core.destroy();

    document.body.innerHTML = '';

    const refreshedForm = createForm(`
      <form data-savior="checkbox-form">
        <input type="checkbox" name="acceptTerms" />
        <input type="checkbox" name="subscribeNewsletter" />
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

    const restoredAccept = refreshedForm.querySelector('input[name="acceptTerms"]');
    const restoredSubscribe = refreshedForm.querySelector('input[name="subscribeNewsletter"]');

    expect(restoredAccept.checked).toBe(true);
    expect(restoredSubscribe.checked).toBe(false);

    if (core && typeof core.destroy === 'function') core.destroy();
  });

  it('supports checkbox groups (same name) by storing selected values array', async () => {
    const form = createForm(`
      <form data-savior="checkbox-group-form">
        <input type="checkbox" name="tags" value="a" />
        <input type="checkbox" name="tags" value="b" />
        <input type="checkbox" name="tags" value="c" />
      </form>
    `);

    const [a, b, c] = form.querySelectorAll('input[name="tags"]');

    let result = Savior.init({
      selector: 'form[data-savior]',
      debug: false,
      storageKeyPrefix: prefix,
      saveDelayMs,
    });
    expect(result.ok).toBe(true);
    let core = result.core;

    a.checked = true;
    b.checked = false;
    c.checked = true;

    a.dispatchEvent(new Event('change', { bubbles: true }));
    b.dispatchEvent(new Event('change', { bubbles: true }));
    c.dispatchEvent(new Event('change', { bubbles: true }));

    await new Promise((resolve) => setTimeout(resolve, saveDelayMs + 50));

    const key = Object.keys(window.localStorage).find((k) => k.includes(prefix));
    expect(key).toBeTruthy();
    const raw = window.localStorage.getItem(key);
    const draft = JSON.parse(raw);
    expect(draft.fields.tags).toBeTruthy();
    expect(draft.fields.tags.__type).toBe('checkboxGroup');
    expect(draft.fields.tags.mode).toBe('value');
    expect(Array.isArray(draft.fields.tags.selected)).toBe(true);
    expect(draft.fields.tags.selected.sort()).toEqual(['a', 'c'].sort());

    if (core && typeof core.destroy === 'function') core.destroy();

    document.body.innerHTML = '';

    const refreshedForm = createForm(`
      <form data-savior="checkbox-group-form">
        <input type="checkbox" name="tags" value="a" />
        <input type="checkbox" name="tags" value="b" />
        <input type="checkbox" name="tags" value="c" />
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

    const [ra, rb, rc] = refreshedForm.querySelectorAll('input[name="tags"]');
    expect(ra.checked).toBe(true);
    expect(rb.checked).toBe(false);
    expect(rc.checked).toBe(true);

    if (core && typeof core.destroy === 'function') core.destroy();
  });

  it('restores radio group selected value', async () => {
    const form = createForm(`
      <form data-savior="radio-form">
        <input type="radio" name="color" value="red" />
        <input type="radio" name="color" value="green" />
        <input type="radio" name="color" value="blue" />
      </form>
    `);

    const radios = form.querySelectorAll('input[name="color"]');
    const [red, green, blue] = radios;

    let result = Savior.init({
      selector: 'form[data-savior]',
      debug: false,
      storageKeyPrefix: prefix,
      saveDelayMs,
    });
    expect(result.ok).toBe(true);
    let core = result.core;

    green.checked = true;
    green.dispatchEvent(new Event('change', { bubbles: true }));

    await new Promise((resolve) => setTimeout(resolve, saveDelayMs + 50));

    if (core && typeof core.destroy === 'function') core.destroy();

    document.body.innerHTML = '';

    const refreshedForm = createForm(`
      <form data-savior="radio-form">
        <input type="radio" name="color" value="red" />
        <input type="radio" name="color" value="green" />
        <input type="radio" name="color" value="blue" />
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

    const refreshedRadios = refreshedForm.querySelectorAll('input[name="color"]');
    const [rRed, rGreen, rBlue] = refreshedRadios;

    expect(rRed.checked).toBe(false);
    expect(rGreen.checked).toBe(true);
    expect(rBlue.checked).toBe(false);

    if (core && typeof core.destroy === 'function') core.destroy();
  });

  it('restores selected options for select and multiple select', async () => {
    const form = createForm(`
      <form data-savior="select-form">
        <select name="country">
          <option value="ca">Canada</option>
          <option value="us">United States</option>
        </select>

        <select name="fruits" multiple>
          <option value="apple">Apple</option>
          <option value="banana">Banana</option>
          <option value="cherry">Cherry</option>
        </select>
      </form>
    `);

    const country = form.querySelector('select[name="country"]');
    const fruits = form.querySelector('select[name="fruits"]');

    let result = Savior.init({
      selector: 'form[data-savior]',
      debug: false,
      storageKeyPrefix: prefix,
      saveDelayMs,
    });
    expect(result.ok).toBe(true);
    let core = result.core;

    country.value = 'us';
    country.dispatchEvent(new Event('change', { bubbles: true }));

    fruits.options[0].selected = true; // apple
    fruits.options[2].selected = true; // cherry
    fruits.dispatchEvent(new Event('change', { bubbles: true }));

    await new Promise((resolve) => setTimeout(resolve, saveDelayMs + 50));

    if (core && typeof core.destroy === 'function') core.destroy();

    document.body.innerHTML = '';

    const refreshedForm = createForm(`
      <form data-savior="select-form">
        <select name="country">
          <option value="ca">Canada</option>
          <option value="us">United States</option>
        </select>

        <select name="fruits" multiple>
          <option value="apple">Apple</option>
          <option value="banana">Banana</option>
          <option value="cherry">Cherry</option>
        </select>
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

    const rCountry = refreshedForm.querySelector('select[name="country"]');
    const rFruits = refreshedForm.querySelector('select[name="fruits"]');

    expect(rCountry.value).toBe('us');

    const selectedValues = Array.from(rFruits.options)
      .filter((opt) => opt.selected)
      .map((opt) => opt.value);

    expect(selectedValues.sort()).toEqual(['apple', 'cherry'].sort());

    if (core && typeof core.destroy === 'function') core.destroy();
  });
});
