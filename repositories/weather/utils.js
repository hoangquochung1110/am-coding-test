/**
 * Weather data validation utilities
 * Contains validation logic shared by all repository implementations
 */

/**
 * Sanitize string values to prevent XSS and SQL injection
 * @param {string} value - String value to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeString(value) {
  if (typeof value !== 'string') return value;
  
  // Basic XSS protection - remove script tags and other potentially harmful HTML
  let sanitized = value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/on\w+=/gi, '');
  
  // Basic SQL injection protection
  sanitized = sanitized.replace(/['";\\]/g, match => '\\' + match);
  
  return sanitized;
}

/**
 * Validate weather data before saving or updating
 * @param {Object} data - Weather data to validate
 * @throws {Error} If validation fails with specific error message
 */
export function validateWeatherData(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid data: Expected an object');
  }

  // Sanitize string fields without modifying the original object
  const sanitizedData = { ...data };
  
  // Only sanitize string fields that exist
  if (sanitizedData.provider) sanitizedData.provider = sanitizeString(sanitizedData.provider);
  if (sanitizedData.city) sanitizedData.city = sanitizeString(sanitizedData.city);
  if (sanitizedData.country) sanitizedData.country = sanitizeString(sanitizedData.country);
  if (sanitizedData.conditionMain) sanitizedData.conditionMain = sanitizeString(sanitizedData.conditionMain);
  if (sanitizedData.conditionDescription) sanitizedData.conditionDescription = sanitizeString(sanitizedData.conditionDescription);
  if (sanitizedData.conditionIcon) sanitizedData.conditionIcon = sanitizeString(sanitizedData.conditionIcon);

  // Check required fields - using original logic
  const requiredFields = [
    'provider', 'city', 'country', 'latitude', 'longitude',
    'temperature', 'feelsLike', 'tempMin', 'tempMax',
    'humidity', 'pressure', 'windSpeed', 'windDirection',
    'conditionMain', 'conditionDescription', 'conditionIcon', 'timestamp'
  ];
  
  const missingFields = requiredFields.filter(field => 
    sanitizedData[field] === undefined || sanitizedData[field] === null || sanitizedData[field] === ''
  );

  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  // Type validation - using original logic
  const validations = [
    { field: 'provider', type: 'string', allowed: ['openweathermap', 'accuweather'] },
    { field: 'timestamp', type: 'date', maxFutureHours: 24 }
  ];

  for (const { field, type, min, max, isInteger, maxLength, allowed, maxFutureHours } of validations) {
    const value = sanitizedData[field];
    
    // Skip if field is not in data (already checked required fields)
    if (value === undefined || value === null) continue;

    // Type checking
    if (type === 'string' && typeof value !== 'string') {
      throw new Error(`Invalid ${field}: must be a string`);
    }
    if (type === 'date' && isNaN(new Date(value).getTime())) {
      throw new Error(`Invalid ${field}: must be a valid date`);
    }
    if (allowed && !allowed.includes(value)) {
      throw new Error(`Invalid ${field}: must be one of ${allowed.join(', ')}`);
    }
    if (type === 'date' && field === 'timestamp' && maxFutureHours) {
      const date = new Date(value);
      const now = new Date();
      const maxFuture = new Date(now.getTime() + (maxFutureHours * 60 * 60 * 1000));
      if (date > maxFuture) {
        throw new Error(`Timestamp cannot be more than ${maxFutureHours} hours in the future`);
      }
    }
  }

  // Additional business logic validations - using original logic
  validateNumericRanges(sanitizedData);
  
  // Return the sanitized data
  return sanitizedData;
}

/**
 * Validate numeric fields are within acceptable ranges
 * @param {Object} data - Weather data to validate
 * @throws {Error} If validation fails
 */
function validateNumericRanges(data) {
  // Define numeric range validations
  const rangeValidations = [
    { field: 'temperature', min: -100, max: 70 },  // Extreme but possible values in °C
    { field: 'feelsLike', min: -100, max: 70 },
    { field: 'humidity', min: 0, max: 100 },       // Percentage
    { field: 'pressure', min: 800, max: 1200 },    // hPa (typical range)
    { field: 'windSpeed', min: 0, max: 150 },      // m/s (extreme but possible)
    { field: 'windDirection', min: 0, max: 360 }   // Degrees
  ];

  for (const { field, min, max } of rangeValidations) {
    const value = data[field];
    
    if (value !== undefined && value !== null) {
      if (typeof value !== 'number') {
        throw new Error(`Invalid ${field}: must be a number`);
      }
      
      if (min !== undefined && value < min) {
        throw new Error(`Invalid ${field}: minimum value is ${min}`);
      }
      
      if (max !== undefined && value > max) {
        throw new Error(`Invalid ${field}: maximum value is ${max}`);
      }
    }
  }
}

/**
 * Validate geographic coordinates
 * @param {Object} data - Weather data with latitude and longitude
 * @throws {Error} If coordinates are invalid
 */
export function validateCoordinates(data) {
  if (!data) return;
  
  if (data.latitude !== undefined && (data.latitude < -90 || data.latitude > 90)) {
    throw new Error('Invalid latitude: must be between -90 and 90');
  }
  
  if (data.longitude !== undefined && (data.longitude < -180 || data.longitude > 180)) {
    throw new Error('Invalid longitude: must be between -180 and 180');
  }
}

/**
 * Create a standardized error object for repository operations
 * @param {Error} error - Original error
 * @param {string} operation - Repository operation that failed
 * @returns {Error} Standardized error object
 */
export function createRepositoryError(error, operation) {
  // Preserve original error message
  const message = `Repository ${operation} operation failed: ${error.message}`;
  
  // Create new error with standardized message
  const repositoryError = new Error(message);
  
  // Add properties to help with error handling
  repositoryError.originalError = error;
  repositoryError.operation = operation;
  repositoryError.isRepositoryError = true;
  
  return repositoryError;
}
