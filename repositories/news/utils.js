/**
 * News data validation utilities
 * Contains validation logic shared by all news repository implementations
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
   * Sanitize and validate news article data
   * @param {Object} data - News article data to sanitize and validate
   * @returns {Object} Sanitized data
   * @throws {Error} If validation fails
   */
  export function sanitizeNewsData(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('News data must be an object');
    }
    
    // Create a sanitized copy of data
    const sanitized = { ...data };
    
    // Sanitize string fields
    if (sanitized.title) sanitized.title = sanitizeString(sanitized.title);
    if (sanitized.description) sanitized.description = sanitizeString(sanitized.description);
    if (sanitized.content) sanitized.content = sanitizeString(sanitized.content);
    if (sanitized.url) sanitized.url = sanitizeString(sanitized.url);
    if (sanitized.imageUrl) sanitized.imageUrl = sanitizeString(sanitized.imageUrl);
    if (sanitized.sourceName) sanitized.sourceName = sanitizeString(sanitized.sourceName);
    if (sanitized.author) sanitized.author = sanitizeString(sanitized.author);
    if (sanitized.provider) sanitized.provider = sanitizeString(sanitized.provider);
    
    return sanitized;
  }
  
  /**
   * Validate news article data
   * @param {Object} data - News article data to validate
   * @throws {Error} If validation fails
   */
  export function validateNewsData(data) {
    // First sanitize the data
    const sanitized = sanitizeNewsData(data);
    
    // Validate required fields
    const requiredFields = ['title', 'content', 'provider'];
    for (const field of requiredFields) {
      if (!sanitized[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    // URL validation
    if (sanitized.url && !/^https?:\/\//i.test(sanitized.url)) {
      throw new Error('URL must start with http:// or https://');
    }
    
    if (sanitized.imageUrl && !/^https?:\/\//i.test(sanitized.imageUrl)) {
      throw new Error('Image URL must start with http:// or https://');
    }
    
    // Date validation
    if (sanitized.publishedAt && isNaN(new Date(sanitized.publishedAt).getTime())) {
      throw new Error('Invalid publishedAt date');
    }
    
    return sanitized;
  }
  
  /**
   * Create a standardized error object for repository operations
   * @param {Error} error - Original error
   * @param {string} operation - Repository operation that failed
   * @returns {Error} Standardized error object
   */
  export function createRepositoryError(error, operation) {
    const message = `News repository ${operation} operation failed: ${error.message}`;
    const repositoryError = new Error(message);
    
    repositoryError.originalError = error;
    repositoryError.operation = operation;
    repositoryError.isRepositoryError = true;
    
    return repositoryError;
  }
  