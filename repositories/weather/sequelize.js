/**
 * Sequelize implementation of WeatherRepositoryInterface
 * For use with standard Node.js environments
 */

import WeatherRepositoryInterface from './interface.js';
import { validateWeatherData, createRepositoryError } from './utils.js';

class SequelizeWeatherRepository extends WeatherRepositoryInterface {
  /**
   * Create a new Sequelize-backed weather repository
   * @param {Object} config - Repository configuration
   * @param {Object} config.model - Sequelize Weather model
   */
  constructor(config) {
    super(config);
    
    if (!config.model) {
      throw new Error('Sequelize Weather model is required');
    }
    
    this.Weather = config.model;
  }

  /**
   * Check if the database and required tables are accessible
   * @returns {Promise<boolean>} True if database is accessible and tables exist
   * @throws {Error} If database connection fails or tables don't exist
   */
  async checkConnection() {
    try {
      // Attempt to query the model to verify connection
      await this.Weather.findOne({ limit: 1 });
      return true;
    } catch (error) {
      throw createRepositoryError(error, 'checkConnection');
    }
  }

  /**
   * Save a weather record to the database
   * @param {Object} data - Weather data to save
   * @returns {Promise<Object>} Saved record with ID and timestamps
   * @throws {Error} If validation fails or database operation errors
   */
  async save(data) {
    try {
      // Validate data before saving
      this.validate(data);
      
      // Create record in database
      return await this.Weather.create(data);
    } catch (error) {
      throw createRepositoryError(error, 'save');
    }
  }

  /**
   * Find a weather record by its ID
   * @param {number|string} id - Record ID
   * @returns {Promise<Object|null>} Weather record or null if not found
   * @throws {Error} If database operation errors
   */
  async findById(id) {
    try {
      return await this.Weather.findByPk(id);
    } catch (error) {
      throw createRepositoryError(error, 'findById');
    }
  }

  /**
   * Find all weather records matching the criteria
   * @param {Object} criteria - Search criteria (field-value pairs)
   * @param {Object} options - Additional options like limit, offset, order
   * @returns {Promise<Array>} Array of matching weather records
   * @throws {Error} If database operation errors
   */
  async findAll(criteria = {}, options = {}) {
    try {
      return await this.Weather.findAll({
        where: criteria,
        ...options
      });
    } catch (error) {
      throw createRepositoryError(error, 'findAll');
    }
  }

  /**
   * Find or create a weather record
   * @param {Object} criteria - Search criteria
   * @param {Object} data - Data for new record if not found
   * @returns {Promise<Array>} [record, created] where created is a boolean
   * @throws {Error} If validation fails or database operation errors
   */
  async findOrCreate(criteria, data) {
    try {
      this.validate(data);
      
      return await this.Weather.findOrCreate({
        where: criteria,
        defaults: data
      });
    } catch (error) {
      throw createRepositoryError(error, 'findOrCreate');
    }
  }

  /**
   * Update a weather record
   * @param {number|string} id - Record ID
   * @param {Object} data - Updated data
   * @returns {Promise<Object>} Updated record
   * @throws {Error} If record not found, validation fails, or database operation errors
   */
  async update(id, data) {
    try {
      const record = await this.findById(id);
      
      if (!record) {
        throw new Error(`Weather record with ID ${id} not found`);
      }
      
      // Validate data before updating
      if (Object.keys(data).length > 0) {
        // For partial updates, only validate the provided fields
        this.validate({ ...record.toJSON(), ...data });
      }
      
      return await record.update(data);
    } catch (error) {
      throw createRepositoryError(error, 'update');
    }
  }

  /**
   * Delete a weather record
   * @param {number|string} id - Record ID
   * @returns {Promise<boolean>} True if record was deleted
   * @throws {Error} If record not found or database operation errors
   */
  async delete(id) {
    try {
      const record = await this.findById(id);
      
      if (!record) {
        throw new Error(`Weather record with ID ${id} not found`);
      }
      
      await record.destroy();
      return true;
    } catch (error) {
      throw createRepositoryError(error, 'delete');
    }
  }

  /**
   * Validate weather data
   * @param {Object} data - Weather data to validate
   * @throws {Error} If validation fails with specific error message
   */
  validate(data) {
    validateWeatherData(data);
  }

  /**
   * Find latest weather records for each city
   * @param {number} limit - Maximum number of cities to return
   * @returns {Promise<Array>} Array of latest weather records by city
   * @throws {Error} If database operation errors
   */
  async findLatestByCity(limit = 10) {
    try {
      // This requires a more complex query with a subquery
      // Get the latest record for each city
      const { Sequelize } = this.Weather.sequelize;
      
      const records = await this.Weather.findAll({
        where: {
          id: {
            [Sequelize.Op.in]: Sequelize.literal(`(
              SELECT MAX(id) FROM weather
              GROUP BY city
              ORDER BY MAX(timestamp) DESC
              LIMIT ${limit}
            )`)
          }
        },
        order: [['timestamp', 'DESC']]
      });
      
      return records;
    } catch (error) {
      throw createRepositoryError(error, 'findLatestByCity');
    }
  }

  /**
   * Get weather statistics for a specific city
   * @param {string} city - City name
   * @param {string} timeRange - Time range (e.g., '24h', '7d', '30d')
   * @returns {Promise<Object>} Weather statistics (min, max, avg temperature, etc.)
   * @throws {Error} If database operation errors
   */
  async getStatsByCity(city, timeRange = '24h') {
    try {
      const { Sequelize } = this.Weather.sequelize;
      const { Op } = Sequelize;
      
      // Convert timeRange to date
      let startDate;
      const now = new Date();
      
      if (timeRange === '24h') {
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      } else if (timeRange === '7d') {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (timeRange === '30d') {
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      } else {
        throw new Error('Invalid time range. Use 24h, 7d, or 30d');
      }
      
      // Query for stats
      const stats = await this.Weather.findAll({
        attributes: [
          [Sequelize.fn('MIN', Sequelize.col('temperature')), 'minTemp'],
          [Sequelize.fn('MAX', Sequelize.col('temperature')), 'maxTemp'],
          [Sequelize.fn('AVG', Sequelize.col('temperature')), 'avgTemp'],
          [Sequelize.fn('MIN', Sequelize.col('humidity')), 'minHumidity'],
          [Sequelize.fn('MAX', Sequelize.col('humidity')), 'maxHumidity'],
          [Sequelize.fn('AVG', Sequelize.col('humidity')), 'avgHumidity'],
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'recordCount']
        ],
        where: {
          city,
          timestamp: {
            [Op.gte]: startDate
          }
        }
      });
      
      return stats[0]?.dataValues || {
        minTemp: null,
        maxTemp: null,
        avgTemp: null,
        minHumidity: null,
        maxHumidity: null,
        avgHumidity: null,
        recordCount: 0
      };
    } catch (error) {
      throw createRepositoryError(error, 'getStatsByCity');
    }
  }
}

export default SequelizeWeatherRepository;