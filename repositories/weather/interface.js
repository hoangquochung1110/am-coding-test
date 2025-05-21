/**
 * WeatherRepositoryInterface
 * 
 * This interface defines the contract that all weather repository implementations must follow.
 * Each method has documentation describing its purpose, parameters, and return type.
 * 
 * This is implemented as a class with non-implemented methods that throw errors,
 * serving as both documentation and a template for concrete implementations.
 */
class WeatherRepositoryInterface {
    /**
     * Initialize the repository
     * @param {Object} config - Configuration options specific to the implementation
     */
    constructor(config) {
      // Force implementation to be a concrete class
      if (this.constructor === WeatherRepositoryInterface) {
        throw new Error('WeatherRepositoryInterface cannot be instantiated directly');
      }
    }
  
    /**
     * Check if the database and required tables are accessible
     * @returns {Promise<boolean>} True if database is accessible and tables exist
     * @throws {Error} If database connection fails or tables don't exist
     */
    async checkConnection() {
      throw new Error('Method checkConnection() must be implemented');
    }
  
    /**
     * Save a weather record to the database
     * @param {Object} data - Weather data to save
     * @returns {Promise<Object>} Saved record with ID and timestamps
     * @throws {Error} If validation fails or database operation errors
     */
    async save(data) {
      throw new Error('Method save() must be implemented');
    }
  
    /**
     * Find a weather record by its ID
     * @param {number|string} id - Record ID
     * @returns {Promise<Object|null>} Weather record or null if not found
     * @throws {Error} If database operation errors
     */
    async findById(id) {
      throw new Error('Method findById() must be implemented');
    }
  
    /**
     * Find all weather records matching the criteria
     * @param {Object} criteria - Search criteria (field-value pairs)
     * @param {Object} options - Additional options like limit, offset, order
     * @returns {Promise<Array>} Array of matching weather records
     * @throws {Error} If database operation errors
     */
    async findAll(criteria = {}, options = {}) {
      throw new Error('Method findAll() must be implemented');
    }
  
    /**
     * Find or create a weather record
     * @param {Object} criteria - Search criteria
     * @param {Object} data - Data for new record if not found
     * @returns {Promise<Array>} [record, created] where created is a boolean
     * @throws {Error} If validation fails or database operation errors
     */
    async findOrCreate(criteria, data) {
      throw new Error('Method findOrCreate() must be implemented');
    }
  
    /**
     * Update a weather record
     * @param {number|string} id - Record ID
     * @param {Object} data - Updated data
     * @returns {Promise<Object>} Updated record
     * @throws {Error} If record not found, validation fails, or database operation errors
     */
    async update(id, data) {
      throw new Error('Method update() must be implemented');
    }
  
    /**
     * Delete a weather record
     * @param {number|string} id - Record ID
     * @returns {Promise<boolean>} True if record was deleted
     * @throws {Error} If record not found or database operation errors
     */
    async delete(id) {
      throw new Error('Method delete() must be implemented');
    }
  
    /**
     * Validate weather data
     * @param {Object} data - Weather data to validate
     * @throws {Error} If validation fails with specific error message
     */
    validate(data) {
      throw new Error('Method validate() must be implemented');
    }
  
    /**
     * Find latest weather records for each city
     * @param {number} limit - Maximum number of cities to return
     * @returns {Promise<Array>} Array of latest weather records by city
     * @throws {Error} If database operation errors
     */
    async findLatestByCity(limit = 10) {
      throw new Error('Method findLatestByCity() must be implemented');
    }
  
    /**
     * Get weather statistics for a specific city
     * @param {string} city - City name
     * @param {string} timeRange - Time range (e.g., '24h', '7d', '30d')
     * @returns {Promise<Object>} Weather statistics (min, max, avg temperature, etc.)
     * @throws {Error} If database operation errors
     */
    async getStatsByCity(city, timeRange = '24h') {
      throw new Error('Method getStatsByCity() must be implemented');
    }

    async count(criteria = {}) {
      throw new Error('Method count() must be implemented');
    }
}

export default WeatherRepositoryInterface;