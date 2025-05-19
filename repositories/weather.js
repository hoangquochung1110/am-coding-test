// repositories/WeatherRepository.js
import { Weather } from '../models/index.js';

class WeatherRepository {
  /**
   * Save a weather record to the database
   * @param {Object} data - Weather data to save
   * @returns {Promise<Object>} Saved record
   */
  async save(data) {
    try {
      this.validate(data);
      return await Weather.create(data);
    } catch (error) {
      console.error('Failed to save weather data:', error);
      throw error;
    }
  }

  /**
   * Find weather record by id
   * @param {number} id - Record ID
   * @returns {Promise<Object>} Weather record
   */
  async findById(id) {
    return Weather.findByPk(id);
  }

  /**
   * Find all weather records matching criteria
   * @param {Object} criteria - Search criteria
   * @param {Object} options - Additional options (limit, order, etc.)
   * @returns {Promise<Array>} Matching records
   */
  async findAll(criteria = {}, options = {}) {
    return Weather.findAll({
      where: criteria,
      ...options
    });
  }

  /**
   * Find or create a weather record
   * @param {Object} criteria - Search criteria
   * @param {Object} data - Data for new record if not found
   * @returns {Promise<Array>} [record, created]
   */
  async findOrCreate(criteria, data) {
    this.validate(data);
    return Weather.findOrCreate({
      where: criteria,
      defaults: data
    });
  }

  /**
   * Update a weather record
   * @param {number} id - Record ID
   * @param {Object} data - Updated data
   * @returns {Promise<Object>} Updated record
   */
  async update(id, data) {
    const record = await this.findById(id);
    if (!record) {
      throw new Error(`Weather record with ID ${id} not found`);
    }
    return record.update(data);
  }

  /**
   * Delete a weather record
   * @param {number} id - Record ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(id) {
    const record = await this.findById(id);
    if (!record) {
      throw new Error(`Weather record with ID ${id} not found`);
    }
    await record.destroy();
    return true;
  }

  /**
   * Validate weather data
   * @param {Object} data - Data to validate
   * @throws {Error} If validation fails
   */
  validate(data) {
    const requiredFields = [
      'city', 'country', 'latitude', 'longitude',
      'temperature', 'feelsLike', 'tempMin', 'tempMax',
      'humidity', 'pressure', 
      'windSpeed', 'windDirection',
      'conditionMain', 'conditionDescription', 'conditionIcon',
      'timestamp'
    ];
    
    const missingFields = requiredFields.filter(field => 
      data[field] === undefined || data[field] === null
    );
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
  }
}

export default WeatherRepository;