import { SaviorCore } from './src/core/savior-core.js';
import { LocalStorageDriver } from './src/drivers/localStorageDriver.js';

const Savior = {
  /**
   * Initialise Savior sur les formulaires ciblés.
   * @param {Object} options
   * @param {string} [options.selector] - Sélecteur des formulaires à protéger.
   * @param {number} [options.saveDelayMs] - Délai avant save (debounce).
   * @param {LocalStorageDriver} [options.driver] - Driver de stockage.
   * @param {boolean} [options.debug] - Active les logs de debug.
   */
  init(options = {}) {
    const driver = options.driver || new LocalStorageDriver();

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
