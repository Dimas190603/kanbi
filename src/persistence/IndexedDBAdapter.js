const DB_NAME = 'kanbi';
const DB_VERSION = 1;
const STORE_NAME = 'state';
const DEFAULT_KEY = 'board';

function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function transactionDone(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () =>
      reject(transaction.error ?? new Error('Transaction cancelled'));
  });
}

function openDataBase() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('Database is not yet available!'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };

    request.onsuccess = () => {
      const db = request.result;
      db.onversionchange = () => db.close();
      resolve(db);
    };
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Database opening is bloked!'));
  });
}

export default class IndexedDBAdapter {
  #dbPromise = null;

  #getDb() {
    if (!this.#dbPromise) {
      this.#dbPromise = openDataBase().catch((error) => {
        this.#dbPromise = null; // Izinkan mencoba lagi nanti
        throw error;
      });
    }
    return this.#dbPromise;
  }

  async load(key = DEFAULT_KEY) {
    const db = await this.#getDb();
    const store = db
      .transaction(STORE_NAME, 'readonly')
      .objectStore(STORE_NAME);

    return requestToPromise(store.get(key));
  }

  async save(record, key = DEFAULT_KEY) {
    const db = await this.#getDb();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put(record, key);
    return transactionDone(transaction);
  }

  async clear() {
    const db = await this.#getDb();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).clear();
    return transactionDone(transaction);
  }
}
