import weatherFilters from './weatherFilters.js';
import newsFilters from './newsFilters.js';
import { Op } from 'sequelize';

export {
  weatherFilters,
  newsFilters
};

/**
 * Process query parameters against a schema
 * @param {Object} query - Query parameters
 * @param {Object} schema - Schema definition
 * @returns {Object} Processed filters
 */
export function processFilters(query, schema) {
  const filters = {};
  
  for (const [key, config] of Object.entries(schema)) {
    if (query[key] !== undefined) {
      // Apply type conversion based on schema
      let value = query[key];
      
      switch (config.type) {
        case 'number':
          value = Number(value);
          break;
        case 'boolean':
          value = value === 'true' || value === true;
          break;
        case 'date':
          value = new Date(value);
          break;
      }
      
      // Validate against allowed values if specified
      if (config.allowed && !config.allowed.includes(value)) {
        console.warn(`Invalid value for ${key}: ${value}. Allowed values: ${config.allowed.join(', ')}`);
        continue;
      }
      
      filters[key] = value;
    } else if (config.default !== undefined) {
      // Apply default value if present in schema
      filters[key] = config.default;
    }
  }
  
  return filters;
}

/**
 * Process weather filters to handle special cases like date ranges
 * @param {Object} filters - Raw filter parameters
 * @returns {Object} Processed filters ready for repository
 */
export function processWeatherFilters(filters) {
  const processedFilters = { ...filters };
  
  // Handle temperature range
  if (filters.minTemperature !== undefined) {
    processedFilters.temperature = { 
      ...processedFilters.temperature,
      [Op.gte]: filters.minTemperature 
    };
    delete processedFilters.minTemperature;
  }
  
  if (filters.maxTemperature !== undefined) {
    processedFilters.temperature = { 
      ...processedFilters.temperature,
      [Op.lte]: filters.maxTemperature 
    };
    delete processedFilters.maxTemperature;
  }
  
  // Handle date range
  if (filters.fromDate) {
    processedFilters.timestamp = { 
      ...processedFilters.timestamp,
      [Op.gte]: filters.fromDate 
    };
    delete processedFilters.fromDate;
  }
  
  if (filters.toDate) {
    processedFilters.timestamp = { 
      ...processedFilters.timestamp,
      [Op.lte]: filters.toDate 
    };
    delete processedFilters.toDate;
  }
  
  return processedFilters;
}

/**
 * Process news filters to handle special cases like date ranges
 * @param {Object} filters - Raw filter parameters
 * @returns {Object} Processed filters ready for repository
 */
export function processNewsFilters(filters) {
  const processedFilters = { ...filters };
  
  // Handle date range
  if (filters.fromDate) {
    processedFilters.publishedAt = { 
      ...processedFilters.publishedAt,
      [Op.gte]: filters.fromDate 
    };
    delete processedFilters.fromDate;
  }
  
  if (filters.toDate) {
    processedFilters.publishedAt = { 
      ...processedFilters.publishedAt,
      [Op.lte]: filters.toDate 
    };
    delete processedFilters.toDate;
  }
  
  // Handle text search
  if (filters.query) {
    // For PostgreSQL, use ILIKE for case-insensitive search
    const searchPattern = `%${filters.query}%`;
    processedFilters[Op.or] = [
      { title: { [Op.iLike]: searchPattern } },
      { description: { [Op.iLike]: searchPattern } },
      { content: { [Op.iLike]: searchPattern } }
    ];
    delete processedFilters.query;
  }
  
  return processedFilters;
}
