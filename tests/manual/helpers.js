export function fillLocalStorageToQuota() {
  try {
    const bigString = 'x'.repeat(1024); // 1 Ko
    let index = 0;

    while (true) {
      const key = `savior:test:quota:${index}`;
      window.localStorage.setItem(key, bigString);
      index += 1;
    }
  } catch (error) {
    console.warn('[Savior Test] Quota likely reached:', error);
  }
}

export function corruptSaviorJson(storageKey) {
  try {
    window.localStorage.setItem(storageKey, '{not-valid-json');
    console.warn('[Savior Test] Storage key corrupted:', storageKey);
  } catch (error) {
    console.error('[Savior Test] Failed to corrupt JSON:', error);
  }
}
