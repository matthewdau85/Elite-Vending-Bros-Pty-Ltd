// Offline Storage utility for PWA
class OfflineStorageClass {
  constructor() {
    this.dbName = 'EliteVendingPWA';
    this.dbVersion = 1;
    this.db = null;
    this.init();
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create stores
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'key' });
        }
        
        if (!db.objectStoreNames.contains('pendingUpdates')) {
          const store = db.createObjectStore('pendingUpdates', { keyPath: 'id', autoIncrement: true });
          store.createIndex('entityType', 'entityType');
          store.createIndex('timestamp', 'timestamp');
        }
        
        if (!db.objectStoreNames.contains('pendingFiles')) {
          db.createObjectStore('pendingFiles', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  async get(key) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const request = store.get(key);
      
      request.onsuccess = () => {
        const result = request.result;
        if (result && result.expiry && result.expiry < Date.now()) {
          // Expired, delete and return null
          this.delete(key);
          resolve(null);
        } else {
          resolve(result ? result.data : null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async set(key, data, ttl = 3600000) { // Default 1 hour TTL
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const expiry = ttl ? Date.now() + ttl : null;
      
      const request = store.put({
        key,
        data,
        expiry,
        timestamp: Date.now()
      });
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async delete(key) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const request = store.delete(key);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async queueUpdate(entityType, entityId, data) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['pendingUpdates'], 'readwrite');
      const store = transaction.objectStore('pendingUpdates');
      
      const request = store.add({
        entityType,
        entityId,
        data,
        timestamp: Date.now(),
        retries: 0
      });
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getPendingUpdates() {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['pendingUpdates'], 'readonly');
      const store = transaction.objectStore('pendingUpdates');
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async removePendingUpdate(id) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['pendingUpdates'], 'readwrite');
      const store = transaction.objectStore('pendingUpdates');
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async queueFile(filename, blob, metadata = {}) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['pendingFiles'], 'readwrite');
      const store = transaction.objectStore('pendingFiles');
      
      const request = store.add({
        filename,
        blob,
        metadata,
        timestamp: Date.now()
      });
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getPendingFiles() {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['pendingFiles'], 'readonly');
      const store = transaction.objectStore('pendingFiles');
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async removePendingFile(id) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['pendingFiles'], 'readwrite');
      const store = transaction.objectStore('pendingFiles');
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear() {
    if (!this.db) await this.init();
    
    const stores = ['cache', 'pendingUpdates', 'pendingFiles'];
    
    for (const storeName of stores) {
      await new Promise((resolve, reject) => {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  }
}

// Export singleton instance
const OfflineStorage = new OfflineStorageClass();
export default OfflineStorage;