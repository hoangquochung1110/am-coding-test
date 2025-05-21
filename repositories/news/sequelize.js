import { NewsRepository } from './interface.js';
import { validateNewsData, createRepositoryError } from './utils.js';

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
      try {
        const sanitizedData = this.validate(data);
        
        if (id) {
          // Update existing article
          const [count, [updated]] = await model.update(
            { ...sanitizedData, updatedAt: new Date() },
            { where: { id }, returning: true }
          );
          return updated;
        }
        
        // Create new article
        return this.create(sanitizedData);
      } catch (error) {
        throw createRepositoryError(error, 'save');
      }
    }
    
    /**
     * Create a new news article
     * @param {Object} data - News article data
     * @returns {Promise<Object>} Created news article
     */
    async create(data) {
      try {
        const sanitizedData = this.validate(data);
        return model.create({
          ...sanitizedData,
          imageUrl: sanitizedData.imageUrl || null,
          publishedAt: sanitizedData.publishedAt || new Date()
        });
      } catch (error) {
        throw createRepositoryError(error, 'create');
      }
    }
    
    // Other methods remain the same...

    /**
     * Validate news article data
     * @param {Object} data - Data to validate
     * @returns {Object} Sanitized and validated data
     * @throws {Error} If validation fails
     */
    validate(data) {
      return validateNewsData(data);
    }

    /**
     * Find all news articles matching criteria with pagination and sorting
     * @param {Object} criteria - Search criteria
     * @param {Object} options - Query options (limit, offset, order, etc.)
     * @returns {Promise<Array>} List of articles
     */
    async findAll(criteria = {}, options = {}) {
      try {
        const { 
          limit = 10, 
          offset = 0, 
          order = [['publishedAt', 'DESC']],
          attributes = undefined
        } = options;

        const queryOptions = {
          where: { ...criteria },
          limit: parseInt(limit, 10),
          offset: parseInt(offset, 10),
          order,
          raw: true,
          nest: true
        };

        if (attributes) {
          queryOptions.attributes = attributes;
        }

        return await model.findAll(queryOptions);
      } catch (error) {
        throw createRepositoryError(error, 'findAll');
      }
    }

    /**
     * Count news articles matching criteria
     * @param {Object} criteria - Search criteria
     * @returns {Promise<number>} Count of matching articles
     */
    async count(criteria = {}) {
      try {
        return await model.count({ where: criteria });
      } catch (error) {
        throw createRepositoryError(error, 'count');
      }
    }
  }

  // Return an instance of the repository
  return new SequelizeNewsRepository();
}
