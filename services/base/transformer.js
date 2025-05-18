/**
 * Base Transformer interface for normalizing external data
 * Transforms data from external sources into our internal representation
 */
class BaseTransformer {
    /**
     * Transform external data to internal format
     * @param {*} rawData - Raw data from external source
     * @returns {Object} Normalized data in internal format
     * @throws {Error} If data validation fails
     */
    normalize(rawData) {
      if (!this.validate(rawData)) {
        throw new Error('Invalid data structure received from external source');
      }
      return this.transform(rawData);
    }
  
    /**
     * Internal transformation logic
     * @param {*} data - Validated external data
     * @returns {Object} Transformed data
     */
    transform(data) {
      throw new Error('transform() method must be implemented');
    }
  
    /**
     * Validate incoming data structure
     * @param {*} data - Raw data to validate
     * @returns {boolean} Validation result
     */
    validate(data) {
      throw new Error('validate() method must be implemented');
    }
  }
  
  export default BaseTransformer;
