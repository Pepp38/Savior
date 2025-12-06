[1mdiff --git a/savior.js b/savior.js[m
[1mindex 4733229..b1a6829 100644[m
[1m--- a/savior.js[m
[1m+++ b/savior.js[m
[36m@@ -2,6 +2,17 @@[m [mimport { SaviorCore } from './src/core/savior-core.js';[m
 import { LocalStorageDriver } from './src/drivers/localStorageDriver.js';[m
 import { SessionStorageDriver } from './src/drivers/sessionStorageDriver.js';[m
 [m
[32m+[m[32mconst DEFAULT_OPTIONS = {[m
[32m+[m[32m  selector: 'form[data-savior]',[m
[32m+[m[32m  saveDelayMs: 400,[m
[32m+[m[32m  debug: false,[m
[32m+[m[32m  storageKeyPrefix: 'savior:',[m
[32m+[m[32m};[m
[32m+[m
[32m+[m[32m/**[m
[32m+[m[32m * Vérifie si localStorage est utilisable dans cet environnement.[m
[32m+[m[32m * Utilisé par checkSupport et les helpers publics.[m
[32m+[m[32m */[m
 function isLocalStorageSupported() {[m
   try {[m
     if (typeof window === 'undefined' || !window.localStorage) {[m
[36m@@ -18,16 +29,75 @@[m [mfunction isLocalStorageSupported() {[m
   }[m
 }[m
 [m
[32m+[m[32m/**[m
[32m+[m[32m * Log de debug centralisé.[m
[32m+[m[32m * Ne produit rien tant que debug === false.[m
[32m+[m[32m */[m
[32m+[m[32mfunction logDebug(options, ...args) {[m
[32m+[m[32m  if (!options?.debug) return;[m
[32m+[m[32m  console.debug('[Savior]', ...args);[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32m/**[m
[32m+[m[32m * Fusionne options utilisateur et valeurs par défaut,[m
[32m+[m[32m * avec une validation légère.[m
[32m+[m[32m */[m
[32m+[m[32mfunction normalizeInitOptions(userOptions = {}) {[m
[32m+[m[32m  const merged = {[m
[32m+[m[32m    ...DEFAULT_OPTIONS,[m
[32m+[m[32m    ...userOptions,[m
[32m+[m[32m  };[m
[32m+[m
[32m+[m[32m  // selector[m
[32m+[m[32m  if (typeof merged.selector !== 'string' || !merged.selector.trim()) {[m
[32m+[m[32m    console.warn([m
[32m+[m[32m      '[Savior] Invalid "selector" option. Falling back to default:',[m
[32m+[m[32m      DEFAULT_OPTIONS.selector[m
[32m+[m[32m    );[m
[32m+[m[32m    merged.selector = DEFAULT_OPTIONS.selector;[m
[32m+[m[32m  }[m
[32m+[m
[32m+[m[32m  // saveDelayMs[m
[32m+[m[32m  if ([m
[32m+[m[32m    typeof merged.saveDelayMs !== 'number' ||[m
[32m+[m[32m    !Number.isFinite(merged.saveDelayMs) ||[m
[32m+[m[32m    merged.saveDelayMs < 0[m
[32m+[m[32m  ) {[m
[32m+[m[32m    console.warn([m
[32m+[m[32m      '[Savior] Invalid "saveDelayMs" option. Using default:',[m
[32m+[m[32m      DEFAULT_OPTIONS.saveDelayMs[m
[32m+[m[32m    );[m
[32m+[m[32m    merged.saveDelayMs = DEFAULT_OPTIONS.saveDelayMs;[m
[32m+[m[32m  }[m
[32m+[m
[32m+[m[32m  // debug[m
[32m+[m[32m  merged.debug = Boolean(merged.debug);[m
[32m+[m
[32m+[m[32m  // storageKeyPrefix[m
[32m+[m[32m  if (typeof merged.storageKeyPrefix !== 'string') {[m
[32m+[m[32m    console.warn([m
[32m+[m[32m      '[Savior] Invalid "storageKeyPrefix" option. Using default:',[m
[32m+[m[32m      DEFAULT_OPTIONS.storageKeyPrefix[m
[32m+[m[32m    );[m
[32m+[m[32m    merged.storageKeyPrefix = DEFAULT_OPTIONS.storageKeyPrefix;[m
[32m+[m[32m  }[m
[32m+[m
[32m+[m[32m  return merged;[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32m/**[m
[32m+[m[32m * Crée le driver par défaut (LocalStorageDriver) avec des options cohérentes.[m
[32m+[m[32m */[m
 function createDefaultDriver(options = {}) {[m
   return new LocalStorageDriver({[m
[31m-    debug: options.debug,[m
[31m-    storageKeyPrefix: options.storageKeyPrefix[m
[32m+[m[32m    debug: Boolean(options.debug),[m
[32m+[m[32m    storageKeyPrefix: options.storageKeyPrefix ?? DEFAULT_OPTIONS.storageKeyPrefix,[m
   });[m
 }[m
 [m
 const Savior = {[m
   /**[m
[31m-   * Check if the current runtime can support Savior safely.[m
[32m+[m[32m   * Vérifie si l'environnement supporte les APIs nécessaires.[m
    * @returns {boolean}[m
    */[m
   checkSupport() {[m
[36m@@ -36,12 +106,21 @@[m [mconst Savior = {[m
 [m
   /**[m
    * Initialise Savior sur les formulaires ciblés.[m
[32m+[m[32m   *[m
[32m+[m[32m   * Flow:[m
[32m+[m[32m   * 1. Vérifie le support du storage (checkSupport).[m
[32m+[m[32m   * 2. Normalise les options avec defaults + validation légère.[m
[32m+[m[32m   * 3. Choisit un driver (par défaut: LocalStorageDriver).[m
[32m+[m[32m   * 4. Crée un SaviorCore, appelle core.init().[m
[32m+[m[32m   * 5. Retourne l'instance de core (avec destroy, etc.).[m
[32m+[m[32m   *[m
    * @param {Object} options[m
[31m-   * @param {string} [options.selector] - Sélecteur des formulaires à protéger.[m
[31m-   * @param {number} [options.saveDelayMs] - Délai avant save (debounce).[m
[31m-   * @param {LocalStorageDriver} [options.driver] - Driver de stockage.[m
[31m-   * @param {boolean} [options.debug] - Active les logs de debug.[m
[31m-   * @param {string} [options.storageKeyPrefix] - Préfixe des clés de stockage (optionnel).[m
[32m+[m[32m   * @param {string} [options.selector][m
[32m+[m[32m   * @param {number} [options.saveDelayMs][m
[32m+[m[32m   * @param {LocalStorageDriver|SessionStorageDriver} [options.driver][m
[32m+[m[32m   * @param {boolean} [options.debug][m
[32m+[m[32m   * @param {string} [options.storageKeyPrefix][m
[32m+[m[32m   * @returns {SaviorCore|null}[m
    */[m
   init(options = {}) {[m
     if (!Savior.checkSupport()) {[m
[36m@@ -53,13 +132,15 @@[m [mconst Savior = {[m
       return null;[m
     }[m
 [m
[31m-    const driver = options.driver || createDefaultDriver(options);[m
[32m+[m[32m    const normalized = normalizeInitOptions(options);[m
[32m+[m[32m    const driver = normalized.driver || createDefaultDriver(normalized);[m
 [m
     const core = new SaviorCore({[m
[31m-      ...options,[m
[31m-      driver[m
[32m+[m[32m      ...normalized,[m
[32m+[m[32m      driver,[m
     });[m
 [m
[32m+[m[32m    logDebug(normalized, 'Calling core.init() with selector', normalized.selector);[m
     core.init();[m
     return core;[m
   },[m
[36m@@ -68,7 +149,7 @@[m [mconst Savior = {[m
    * Récupère le draft brut pour un formId donné (ou null si absent / non supporté).[m
    * @param {string} formId[m
    * @param {Object} [options][m
[31m-   * @param {LocalStorageDriver} [options.driver][m
[32m+[m[32m   * @param {LocalStorageDriver|SessionStorageDriver} [options.driver][m
    * @param {boolean} [options.debug][m
    * @param {string} [options.storageKeyPrefix][m
    * @returns {Object|null}[m
[36m@@ -77,7 +158,12 @@[m [mconst Savior = {[m
     if (!formId) return null;[m
     if (!Savior.checkSupport()) return null;[m
 [m
[31m-    const driver = options.driver || createDefaultDriver(options);[m
[32m+[m[32m    const effectiveOptions = {[m
[32m+[m[32m      ...DEFAULT_OPTIONS,[m
[32m+[m[32m      ...options,[m
[32m+[m[32m    };[m
[32m+[m
[32m+[m[32m    const driver = effectiveOptions.driver || createDefaultDriver(effectiveOptions);[m
     return driver.load(formId);[m
   },[m
 [m
[36m@@ -85,7 +171,7 @@[m [mconst Savior = {[m
    * Efface le draft pour un formId donné.[m
    * @param {string} formId[m
    * @param {Object} [options][m
[31m-   * @param {LocalStorageDriver} [options.driver][m
[32m+[m[32m   * @param {LocalStorageDriver|SessionStorageDriver} [options.driver][m
    * @param {boolean} [options.debug][m
    * @param {string} [options.storageKeyPrefix][m
    */[m
[36m@@ -93,7 +179,12 @@[m [mconst Savior = {[m
     if (!formId) return;[m
     if (!Savior.checkSupport()) return;[m
 [m
[31m-    const driver = options.driver || createDefaultDriver(options);[m
[32m+[m[32m    const effectiveOptions = {[m
[32m+[m[32m      ...DEFAULT_OPTIONS,[m
[32m+[m[32m      ...options,[m
[32m+[m[32m    };[m
[32m+[m
[32m+[m[32m    const driver = effectiveOptions.driver || createDefaultDriver(effectiveOptions);[m
     driver.clear(formId);[m
   },[m
 [m
[36m@@ -109,7 +200,8 @@[m [mconst Savior = {[m
   },[m
 [m
   LocalStorageDriver,[m
[31m-  SessionStorageDriver[m
[32m+[m[32m  SessionStorageDriver,[m
 };[m
 [m
 export default Savior;[m
[32m+[m[32mexport { LocalStorageDriver, SessionStorageDriver };[m
