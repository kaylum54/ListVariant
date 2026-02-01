export class Storage {
  static async get(key: string): Promise<string | null> {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.local.get([key], (result) => {
          if (chrome.runtime.lastError) {
            console.error('[SyncSellr Storage] get error:', chrome.runtime.lastError.message);
            resolve(null);
            return;
          }
          resolve(result[key] || null);
        });
      } catch (err) {
        // Extension context may be invalidated
        console.error('[SyncSellr Storage] get threw:', err);
        resolve(null);
      }
    });
  }

  static async set(key: string, value: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.local.set({ [key]: value }, () => {
          if (chrome.runtime.lastError) {
            console.error('[SyncSellr Storage] set error:', chrome.runtime.lastError.message);
          }
          resolve();
        });
      } catch (err) {
        console.error('[SyncSellr Storage] set threw:', err);
        resolve();
      }
    });
  }

  static async remove(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.local.remove(key, () => {
          if (chrome.runtime.lastError) {
            console.error('[SyncSellr Storage] remove error:', chrome.runtime.lastError.message);
          }
          resolve();
        });
      } catch (err) {
        console.error('[SyncSellr Storage] remove threw:', err);
        resolve();
      }
    });
  }
}
