/**
 * Neon Serverless implementation of WeatherRepositoryInterface
 * For use with Cloudflare Workers and other serverless environments
 */

import { neon } from '@neondatabase/serverless';
import WeatherRepositoryInterface from './interface.js';
import { validateWeatherData, createRepositoryError } from './utils.js';

class NeonWeatherRepository extends WeatherRepositoryInterface {
  /**
   * Create a new Neon-backed weather repository
   * @param {Object} config - Repository configuration
   * @param {string} config.connectionString - Database connection string
   * @param {Object} config.connection - Or individual connection parameters
   */
  constructor(config) {
    super(config);
    
    // Support either connection string or individual parameters
    if (config.connectionString) {
      this.connectionString = config.connectionString;
    } else if (config.connection) {
      const { host, database, user, password, port = 5432 } = config.connection;
      
      if (!host || !database || !user || !password) {
        throw new Error('Connection requires host, database, user, and password');
      }
      
      this.connectionString = `postgres://${user}:${password}@${host}:${port}/${database}?sslmode=require`;
    } else {
      throw new Error('Either connectionString or connection parameters are required');
    }
    
    // Initialize the neon client
    this.sql = neon(this.connectionString);
  }

  /**
   * Check if the database and required tables are accessible
   * @returns {Promise<boolean>} True if database is accessible and tables exist
   * @throws {Error} If database connection fails or tables don't exist
   */
  async checkConnection() {
    try {
      await this.sql`SELECT * FROM weather LIMIT 1`;
      return true;
    } catch (error) {
      throw createRepositoryError(
        new Error('Weather table not found or not accessible'), 
        'checkConnection'
      );
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
      
      // Insert new record
      const result = await this.sql`
        INSERT INTO weather(
          provider, city, country, latitude, longitude, 
          temperature, "feelsLike", "tempMin", "tempMax",
          humidity, pressure, "windSpeed", "windDirection",
          "conditionMain", "conditionDescription", "conditionIcon", 
          timestamp, "createdAt", "updatedAt"
        )
        VALUES(
          ${data.provider}, ${data.city}, ${data.country}, ${data.latitude}, ${data.longitude},
          ${data.temperature}, ${data.feelsLike}, ${data.tempMin}, ${data.tempMax},
          ${data.humidity}, ${data.pressure}, ${data.windSpeed}, ${data.windDirection},
          ${data.conditionMain}, ${data.conditionDescription}, ${data.conditionIcon},
          ${data.timestamp}, NOW(), NOW()
        )
        RETURNING *
      `;
      
      return result[0];
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
      const result = await this.sql`
        SELECT * FROM weather WHERE id = ${id}
      `;
      
      return result.length > 0 ? result[0] : null;
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
      // Build dynamic WHERE clause based on criteria
      let whereClause = '';
      const whereParts = [];
      const values = [];
      
      // Process each criteria field
      Object.entries(criteria).forEach(([key, value]) => {
        whereParts.push(`"${key}" = $${values.length + 1}`);
        values.push(value);
      });
      
      if (whereParts.length > 0) {
        whereClause = `WHERE ${whereParts.join(' AND ')}`;
      }
      
      // Add limit and ordering if provided
      let limitClause = '';
      if (options.limit) {
        limitClause = `LIMIT ${options.limit}`;
      }
      
      let orderClause = '';
      if (options.order && options.order.length > 0) {
        const orderParts = options.order.map(([column, direction]) => 
          `"${column}" ${direction}`
        );
        orderClause = `ORDER BY ${orderParts.join(', ')}`;
      }
      
      // Execute the constructed query
      const query = `
        SELECT * FROM weather 
        ${whereClause} 
        ${orderClause} 
        ${limitClause}
      `;
      
      return await this.sql.raw(query, values);
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
      // Validate data
      this.validate(data);
      
      // Build WHERE clause for criteria
      const whereParts = [];
      
      Object.entries(criteria).forEach(([key, value]) => {
        whereParts.push(`"${key}" = ${value}`);
      });
      
      const whereClause = whereParts.join(' AND ');
      
      // Check if record exists
      const existingRecords = await this.sql`
        SELECT * FROM weather 
        WHERE ${this.sql.raw(whereClause)}
        LIMIT 1
      `;
      
      // If record exists, return it
      if (existingRecords.length > 0) {
        return [existingRecords[0], false];
      }
      
      // Create new record
      const newRecord = await this.save(data);
      return [newRecord, true];
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
      // Check if record exists
      const record = await this.findById(id);
      
      if (!record) {
        throw new Error(`Weather record with ID ${id} not found`);
      }
      
      // Skip empty updates
      if (Object.keys(data).length === 0) {
        return record;
      }
      
      // Validate the full updated record data
      const updatedData = { ...record, ...data };
      this.validate(updatedData);
      
      // Build SET clause for update
      const setParts = [];
      
      Object.entries(data).forEach(([key, value]) => {
        setParts.push(`"${key}" = ${value}`);
      });
      
      // Add updatedAt timestamp
      setParts.push(`"updatedAt" = NOW()`);
      
      const setClause = setParts.join(', ');
      
      // Execute update
      const result = await this.sql`
        UPDATE weather
        SET ${this.sql.raw(setClause)}
        WHERE id = ${id}
        RETURNING *
      `;
      
      return result[0];
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
      // Check if record exists
      const record = await this.findById(id);
      
      if (!record) {
        throw new Error(`Weather record with ID ${id} not found`);
      }
      
      // Delete the record
      await this.sql`
        DELETE FROM weather WHERE id = ${id}
      `;
      
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
      // Use a subquery to get the latest record for each city
      const query = `
        WITH latest_by_city AS (
          SELECT DISTINCT ON (city) *
          FROM weather
          ORDER BY city, timestamp DESC
        )
        SELECT * FROM latest_by_city
        ORDER BY timestamp DESC
        LIMIT ${limit}
      `;
      
      return await this.sql.raw(query);
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
      // Determine the start date based on timeRange
      let interval;
      
      if (timeRange === '24h') {
        interval = '1 day';
      } else if (timeRange === '7d') {
        interval = '7 days';
      } else if (timeRange === '30d') {
        interval = '30 days';
      } else {
        throw new Error('Invalid time range. Use 24h, 7d, or 30d');
      }
      
      // Get statistics
      const result = await this.sql`
        SELECT 
          MIN(temperature) as "minTemp", 
          MAX(temperature) as "maxTemp", 
          AVG(temperature) as "avgTemp",
          MIN(humidity) as "minHumidity", 
          MAX(humidity) as "maxHumidity", 
          AVG(humidity) as "avgHumidity",
          COUNT(id) as "recordCount"
        FROM weather
        WHERE 
          city = ${city} AND 
          timestamp > NOW() - ${this.sql.raw(`INTERVAL '${interval}'`)}
      `;
      
      return result[0] || {
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

  async count(criteria = {}) {
    try {
      // Build where clause based on criteria
      let whereClause = '';
      const values = [];
      
      if (Object.keys(criteria).length > 0) {
        const whereParts = [];
        Object.entries(criteria).forEach(([key, value], index) => {
          whereParts.push(`"${key}" = $${index + 1}`);
          values.push(value);
        });
        whereClause = `WHERE ${whereParts.join(' AND ')}`;
      }
      
      const result = await this.sql`
        SELECT COUNT(*) as count FROM weather ${this.sql.raw(whereClause)}
      `;
      
      return parseInt(result[0].count, 10);
    } catch (error) {
      throw createRepositoryError(error, 'count');
    }
  }
}

export default NeonWeatherRepository;