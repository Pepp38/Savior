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

function createDefaultDriver(options = {}) {
  return new LocalStorageDriver({
    debug: options.debug,
    storageKeyPrefix: options.storageKeyPrefix
  });
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
   * @param {string} [options.storageKeyPrefix] - Préfixe des clés de stockage (optionnel).
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

    const driver = options.driver || createDefaultDriver(options);

    const core = new SaviorCore({
      ...options,
      driver
    });

    core.init();
    return core;
  },

  /**
   * Récupère le draft brut pour un formId donné (ou null si absent / non supporté).
   * @param {string} formId
   * @param {Object} [options]
   * @param {LocalStorageDriver} [options.driver]
   * @param {boolean} [options.debug]
   * @param {string} [options.storageKeyPrefix]
   * @returns {Object|null}
   */
  getDraft(formId, options = {}) {
    if (!formId) return null;
    if (!Savior.checkSupport()) return null;

    const driver = options.driver || createDefaultDriver(options);
    return driver.load(formId);
  },

  /**
   * Efface le draft pour un formId donné.
   * @param {string} formId
   * @param {Object} [options]
   * @param {LocalStorageDriver} [options.driver]
   * @param {boolean} [options.debug]
   * @param {string} [options.storageKeyPrefix]
   */
  clearDraft(formId, options = {}) {
    if (!formId) return;
    if (!Savior.checkSupport()) return;

    const driver = options.driver || createDefaultDriver(options);
    driver.clear(formId);
  },

  /**
   * Exporte le draft sous forme de JSON pretty-printé (string) ou null.
   * @param {string} formId
   * @param {Object} [options]
   * @returns {string|null}
   */
  exportDraft(formId, options = {}) {
    const draft = Savior.getDraft(formId, options);
    return draft ? JSON.stringify(draft, null, 2) : null;
  },

  LocalStorageDriver
};

export default Savior;
