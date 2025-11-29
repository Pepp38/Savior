import { SaviorCore } from './src/core/savior-core.js';
import { LocalStorageDriver } from './src/drivers/localStorageDriver.js';

function isLocalStorageSupported() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }

    const testKey = '__savior_support_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);

    return true;
  } catch {
    return false;
  }
}

const Savior = {
  /**
   * Check if the current runtime can support Savior safely.
   * @returns {boolean}
   */
  checkSupport() {
    return isLocalStorageSupported();
  },

  /**
   * Initialise Savior sur les formulaires ciblés.
   * @param {Object} options
   * @param {string} [options.selector] - Sélecteur des formulaires à protéger.
   * @param {number} [options.saveDelayMs] - Délai avant save (debounce).
   * @param {LocalStorageDriver} [options.driver] - Driver de stockage.
   * @param {boolean} [options.debug] - Active les logs de debug.
   */
  init(options = {}) {
    if (!Savior.checkSupport()) {
      if (options.debug) {
        console.warn(
          '[Savior] Environment does not support required storage APIs. Initialization skipped.'
        );
      }
      return null;
    }

const driver = options.driver || new LocalStorageDriver({ debug: options.debug });

    const core = new SaviorCore({
      ...options,
      driver
    });

    core.init();
    return core;
  },

  LocalStorageDriver
};

export default Savior;
