import { NewsRepository } from './interface.js';

/**
 * Creates a new Sequelize-backed news repository
 * @param {Object} config - Configuration options
 * @param {Object} config.model - Sequelize News model
 * @returns {NewsRepository} Configured news repository instance
 */
export default function createSequelizeRepository(config) {
  if (!config?.model) {
    throw new Error('Sequelize News model is required');
  }

  const model = config.model;

  /**
   * Sequelize implementation of NewsRepository
   */
  class SequelizeNewsRepository extends NewsRepository {
    constructor() {
      super();
      if (!model) {
        throw new Error('Sequelize News model is required');
      }
    }

    /**
     * Save a news article (create if new, update if existing)
     * @param {Object} data - News article data
     * @param {number} [id] - Optional article ID for update
     * @returns {Promise<Object>} Saved news article
     */
    async save(data, id) {
      this.validate(data);
      
      if (id) {
        // Update existing article
        const [count, [updated]] = await model.update(
          { ...data, updatedAt: new Date() },
          { where: { id }, returning: true }
        );
        return updated;
      }
      
      // Create new article
      return this.create(data);
    }
    
    /**
     * Create a new news article
     * @param {Object} data - News article data
     * @returns {Promise<Object>} Created news article
     */
    async create(data) {
      this.validate(data);
      return model.create({
        ...data,
        imageUrl: data.imageUrl || null,
        publishedAt: data.publishedAt || new Date()
      });
    }
    
    /**
     * Find a news article by ID
     * @param {number} id - Article ID
     * @returns {Promise<Object|null>} Found article or null
     */
    async findById(id) {
      return model.findByPk(id);
    }
    
    /**
     * Find news articles by provider
     * @param {string} provider - Provider name
     * @param {Object} [options] - Query options
     * @returns {Promise<Array>} List of articles
     */
    async findByProvider(provider, options = {}) {
      return model.findAll({
        where: { provider },
        order: [['publishedAt', 'DESC']],
        limit: options.limit || 10,
        offset: options.offset || 0
      });
    }
    
    /**
     * Update a news article
     * @param {number} id - Article ID
     * @param {Object} data - Data to update
     * @returns {Promise<Object>} Updated article
     */
    async update(id, data) {
      this.validate(data);
      const [count, [updated]] = await model.update(
        { ...data, updatedAt: new Date() },
        { where: { id }, returning: true }
      );
      if (!updated) {
        throw new Error(`Article with ID ${id} not found`);
      }
      return updated;
    }
    
    /**
     * Delete a news article
     * @param {number} id - Article ID
     * @returns {Promise<boolean>} True if deleted, false otherwise
     */
    async delete(id) {
      const count = await model.destroy({ where: { id } });
      return count > 0;
    }
    
    /**
     * Validate news article data
     * @param {Object} data - Data to validate
     * @throws {Error} If validation fails
     */
    validate(data) {
      if (!data || typeof data !== 'object') {
        throw new Error('News data must be an object');
      }
      
      const requiredFields = ['title', 'content', 'provider'];
      for (const field of requiredFields) {
        if (!data[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }
      
      if (data.url && !/^https?:\/\//.test(data.url)) {
        throw new Error('URL must start with http:// or https://');
      }
      
      if (data.imageUrl && !/^https?:\/\//.test(data.imageUrl)) {
        throw new Error('Image URL must start with http:// or https://');
      }
      
      if (data.publishedAt && isNaN(new Date(data.publishedAt).getTime())) {
        throw new Error('Invalid publishedAt date');
      }
    }
  }

  // Return an instance of the repository
  return new SequelizeNewsRepository();
}