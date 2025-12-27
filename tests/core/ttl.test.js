import { describe, it, expect } from 'vitest';
import Savior from '../../savior.js';
import { createForm } from '../setup/browser-env.js';

describe('Savior – maxAgeMs (TTL) behavior', () => {
  it('ignores stale drafts when maxAgeMs is provided', async () => {
    const prefix = 'savior:test:ttl:';
    const formId = 'ttl-form';
    const storageKey = `${prefix}${formId}`;

    // Draft from "yesterday"
    const oldTs = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        formId,
        timestampUtc: oldTs,
        fields: { title: 'OLD' },
      })
    );

    const form = createForm(`
      <form data-savior="${formId}">
        <input type="text" name="title" />
      </form>
    `);

    const core = Savior.init({
      selector: 'form[data-savior]',
      debug: false,
      storageKeyPrefix: prefix,
      maxAgeMs: 60_000, // 1 minute
    });

    const input = form.querySelector('input[name="title"]');
    expect(input.value).toBe('');

    if (core && typeof core.destroy === 'function') core.destroy();
  });
});
