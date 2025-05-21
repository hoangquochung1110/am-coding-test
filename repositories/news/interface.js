/**
 * Interface for NewsRepository
 */
export class NewsRepository {
  /**
   * Create a new news article
   * @param {Object} data - News article data
   * @returns {Promise<News>} Created news article
   */
  create(data) {
    throw new Error('Method must be implemented');
  }

  /**
   * Find a news article by ID
   * @param {number} id - Article ID
   * @returns {Promise<News|null>} Found article or null
   */
  findById(id) {
    throw new Error('Method must be implemented');
  }

  /**
   * Find news articles by provider
   * @param {string} provider - Provider name
   * @param {Object} options - Query options
   * @returns {Promise<News[]>} List of articles
   */
  findByProvider(provider, options = {}) {
    throw new Error('Method must be implemented');
  }

  /**
   * Find news articles by search query
   * @param {string} query - Search query
   * @param {Object} options - Query options
   * @returns {Promise<News[]>} List of articles
   */
  search(query, options = {}) {
    throw new Error('Method must be implemented');
  }

  /**
   * Update a news article
   * @param {number} id - Article ID
   * @param {Object} data - Data to update
   * @returns {Promise<News>} Updated article
   */
  update(id, data) {
    throw new Error('Method must be implemented');
  }

  /**
   * Delete a news article
   * @param {number} id - Article ID
   * @returns {Promise<boolean>} Success status
   */
  delete(id) {
    throw new Error('Method must be implemented');
  }

  /**
   * Validate news article data
   * @param {Object} data - Data to validate
   * @throws {Error} If validation fails
   */
  validate(data) {
    throw new Error('Method must be implemented');
  }

  /**
   * Find all news articles matching criteria
   * @param {Object} criteria - Search criteria
   * @param {Object} options - Query options (limit, offset, order, etc.)
   * @returns {Promise<Array>} List of articles
   */
  findAll(criteria = {}, options = {}) {
    throw new Error('Method must be implemented');
  }

  /**
   * Count news articles matching criteria
   * @param {Object} criteria - Search criteria
   * @returns {Promise<number>} Count of matching articles
   */
  count(criteria = {}) {
    throw new Error('Method must be implemented');
  }
}
