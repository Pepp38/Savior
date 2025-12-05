import { SaviorCore } from './src/core/savior-core.js';
import { LocalStorageDriver } from './src/drivers/localStorageDriver.js';
import { SessionStorageDriver } from './src/drivers/sessionStorageDriver.js';

const DEFAULT_OPTIONS = {
  selector: 'form[data-savior]',
  saveDelayMs: 400,
  debug: false,
  storageKeyPrefix: 'savior:',
};

/**
 * Vérifie si localStorage est utilisable dans cet environnement.
 * Utilisé par checkSupport et les helpers publics.
 */
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

/**
 * Log de debug centralisé.
 * Ne produit rien tant que debug === false.
 */
function logDebug(options, ...args) {
  if (!options?.debug) return;
  console.debug('[Savior]', ...args);
}

/**
 * Fusionne options utilisateur et valeurs par défaut,
 * avec une validation légère.
 */
function normalizeInitOptions(userOptions = {}) {
  const merged = {
    ...DEFAULT_OPTIONS,
    ...userOptions,
  };

  // selector
  if (typeof merged.selector !== 'string' || !merged.selector.trim()) {
    console.warn(
      '[Savior] Invalid "selector" option. Falling back to default:',
      DEFAULT_OPTIONS.selector
    );
    merged.selector = DEFAULT_OPTIONS.selector;
  }

  // saveDelayMs
  if (
    typeof merged.saveDelayMs !== 'number' ||
    !Number.isFinite(merged.saveDelayMs) ||
    merged.saveDelayMs < 0
  ) {
    console.warn(
      '[Savior] Invalid "saveDelayMs" option. Using default:',
      DEFAULT_OPTIONS.saveDelayMs
    );
    merged.saveDelayMs = DEFAULT_OPTIONS.saveDelayMs;
  }

  // debug
  merged.debug = Boolean(merged.debug);

  // storageKeyPrefix
  if (typeof merged.storageKeyPrefix !== 'string') {
    console.warn(
      '[Savior] Invalid "storageKeyPrefix" option. Using default:',
      DEFAULT_OPTIONS.storageKeyPrefix
    );
    merged.storageKeyPrefix = DEFAULT_OPTIONS.storageKeyPrefix;
  }

  return merged;
}

/**
 * Crée le driver par défaut (LocalStorageDriver) avec des options cohérentes.
 */
function createDefaultDriver(options = {}) {
  return new LocalStorageDriver({
    debug: Boolean(options.debug),
    storageKeyPrefix: options.storageKeyPrefix ?? DEFAULT_OPTIONS.storageKeyPrefix,
  });
}

const Savior = {
  /**
   * Vérifie si l'environnement supporte les APIs nécessaires.
   * @returns {boolean}
   */
  checkSupport() {
    return isLocalStorageSupported();
  },

  /**
   * Initialise Savior sur les formulaires ciblés.
   *
   * Flow:
   * 1. Vérifie le support du storage (checkSupport).
   * 2. Normalise les options avec defaults + validation légère.
   * 3. Choisit un driver (par défaut: LocalStorageDriver).
   * 4. Crée un SaviorCore, appelle core.init().
   * 5. Retourne l'instance de core (avec destroy, etc.).
   *
   * @param {Object} options
   * @param {string} [options.selector]
   * @param {number} [options.saveDelayMs]
   * @param {LocalStorageDriver|SessionStorageDriver} [options.driver]
   * @param {boolean} [options.debug]
   * @param {string} [options.storageKeyPrefix]
   * @returns {SaviorCore|null}
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

    const normalized = normalizeInitOptions(options);
    const driver = normalized.driver || createDefaultDriver(normalized);

    const core = new SaviorCore({
      ...normalized,
      driver,
    });

    logDebug(normalized, 'Calling core.init() with selector', normalized.selector);
    core.init();
    return core;
  },

  /**
   * Récupère le draft brut pour un formId donné (ou null si absent / non supporté).
   * @param {string} formId
   * @param {Object} [options]
   * @param {LocalStorageDriver|SessionStorageDriver} [options.driver]
   * @param {boolean} [options.debug]
   * @param {string} [options.storageKeyPrefix]
   * @returns {Object|null}
   */
  getDraft(formId, options = {}) {
    if (!formId) return null;
    if (!Savior.checkSupport()) return null;

    const effectiveOptions = {
      ...DEFAULT_OPTIONS,
      ...options,
    };

    const driver = effectiveOptions.driver || createDefaultDriver(effectiveOptions);
    return driver.load(formId);
  },

  /**
   * Efface le draft pour un formId donné.
   * @param {string} formId
   * @param {Object} [options]
   * @param {LocalStorageDriver|SessionStorageDriver} [options.driver]
   * @param {boolean} [options.debug]
   * @param {string} [options.storageKeyPrefix]
   */
  clearDraft(formId, options = {}) {
    if (!formId) return;
    if (!Savior.checkSupport()) return;

    const effectiveOptions = {
      ...DEFAULT_OPTIONS,
      ...options,
    };

    const driver = effectiveOptions.driver || createDefaultDriver(effectiveOptions);
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

  LocalStorageDriver,
  SessionStorageDriver,
};

export default Savior;
export { LocalStorageDriver, SessionStorageDriver };
