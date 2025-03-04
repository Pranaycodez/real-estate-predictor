/**
 * Service for storing and retrieving trained models using IndexedDB
 */
class ModelStorageService {
  constructor() {
    this.dbName = 'RealEstatePredictorDB';
    this.storeName = 'trainedModels';
    this.version = 1;
    this.db = null;
  }

  /**
   * Initialize the IndexedDB database
   */
  async initDatabase() {
    if (this.db) return Promise.resolve(this.db);

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('Error opening IndexedDB:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  /**
   * Store a trained model with metadata
   * @param {Object} model - The trained model to store
   * @param {Object} metadata - Model metadata (accuracy, features, timestamp, etc)
   */
  async saveModel(model, metadata = {}) {
    try {
      await this.initDatabase();
      
      const serializedModel = JSON.stringify(model);
      const timestamp = new Date().toISOString();
      const id = `model_${timestamp}`;
      
      const modelData = {
        id,
        name: metadata.name || `Model ${new Date().toLocaleString()}`,
        model: serializedModel,
        features: metadata.features || [],
        accuracy: metadata.accuracy || 0,
        rmse: metadata.rmse || 0,
        created: timestamp,
        description: metadata.description || 'Real Estate Price Prediction Model'
      };

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.add(modelData);

        request.onsuccess = () => resolve(modelData);
        request.onerror = (e) => reject(e.target.error);
      });
    } catch (error) {
      console.error('Error saving model to IndexedDB:', error);
      throw error;
    }
  }

  /**
   * Get all stored models
   */
  async getAllModels() {
    try {
      await this.initDatabase();
      
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = (e) => reject(e.target.error);
      });
    } catch (error) {
      console.error('Error getting models from IndexedDB:', error);
      throw error;
    }
  }

  /**
   * Get a specific model by ID
   * @param {string} id - The model ID
   */
  async getModelById(id) {
    try {
      await this.initDatabase();
      
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.get(id);

        request.onsuccess = () => {
          const modelData = request.result;
          if (modelData) {
            // Parse the serialized model back to an object
            try {
              const model = JSON.parse(modelData.model);
              resolve({
                ...modelData,
                model
              });
            } catch (error) {
              reject(new Error('Failed to parse model data'));
            }
          } else {
            resolve(null);
          }
        };
        request.onerror = (e) => reject(e.target.error);
      });
    } catch (error) {
      console.error('Error getting model from IndexedDB:', error);
      throw error;
    }
  }

  /**
   * Get the most recent model
   */
  async getMostRecentModel() {
    try {
      const models = await this.getAllModels();
      if (models && models.length > 0) {
        // Sort by created date and get the most recent
        models.sort((a, b) => new Date(b.created) - new Date(a.created));
        const modelData = models[0];
        
        // Parse the serialized model back to an object
        try {
          const model = JSON.parse(modelData.model);
          return {
            ...modelData,
            model
          };
        } catch (error) {
          throw new Error('Failed to parse model data');
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting most recent model:', error);
      throw error;
    }
  }

  /**
   * Delete a model by ID
   * @param {string} id - The model ID to delete
   */
  async deleteModel(id) {
    try {
      await this.initDatabase();
      
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.delete(id);

        request.onsuccess = () => resolve(true);
        request.onerror = (e) => reject(e.target.error);
      });
    } catch (error) {
      console.error('Error deleting model from IndexedDB:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const modelStorageService = new ModelStorageService();
export default modelStorageService;
