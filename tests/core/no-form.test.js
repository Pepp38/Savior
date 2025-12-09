import Savior from '../../savior.js';

describe('Savior.init with no matching forms', () => {
  it('does nothing and does not throw when selector matches nothing', () => {
    // DOM is empty because of beforeEach in setup
    const fn = () =>
      Savior.init({
        selector: 'form[data-nonexistent]',
        debug: true,
        storageKeyPrefix: 'savior:test:noform:',
      });

    expect(fn).not.toThrow();
    expect(window.localStorage.length).toBe(0);
  });
});
