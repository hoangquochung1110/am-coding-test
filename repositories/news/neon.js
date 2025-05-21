import { neon } from '@neondatabase/serverless';
import { NewsRepository } from './interface.js';

/**
 * Helper function to create consistent error objects
 * @param {Error} error - Original error
 * @param {string} method - Method name where error occurred
 * @returns {Error} Enhanced error with method context
 */
function createRepositoryError(error, method) {
  const newError = new Error(`[NeonNewsRepository.${method}] ${error.message}`);
  newError.originalError = error;
  newError.method = method;
  return newError;
}

/**
 * Creates a new Neon-backed news repository
 * @param {Object} config - Configuration options
 * @param {string} [config.connectionString] - Database connection string
 * @param {Object} [config.connection] - Connection parameters (alternative to connectionString)
 * @returns {NewsRepository} Configured news repository instance
 */
export default function createNeonRepository(config = {}) {
  if (!config.connectionString && !config.connection) {
    throw new Error('Neon repository requires either connectionString or connection parameters');
  }

  let sql;
  
  try {
    sql = config.connectionString 
      ? neon(config.connectionString)
      : neon(config.connection);
  } catch (error) {
    throw new Error(`Failed to create Neon client: ${error.message}`);
  }

  /**
   * Neon implementation of NewsRepository
   */
  class NeonNewsRepository extends NewsRepository {
    /**
     * Create a new Neon-backed news repository
     */
    constructor() {
      super();
      if (!sql) {
        throw new Error('Neon client not initialized');
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
        this.validate(data);
        
        if (id) {
          // Update existing article
          const result = await sql`
            UPDATE news
            SET 
              title = ${data.title},
              description = ${data.description || null},
              content = ${data.content},
              url = ${data.url || null},
              "imageUrl" = ${data.imageUrl || null},
              "publishedAt" = ${data.publishedAt || new Date()},
              "sourceName" = ${data.sourceName || null},
              author = ${data.author || null},
              provider = ${data.provider},
              "createdAt" = NOW()
            WHERE id = ${id}
            RETURNING *
          `;
          
          if (!result.rows.length) {
            throw new Error(`Article with ID ${id} not found`);
          }
          
          return result.rows[0];
        }
        
        // Create new article
        return this.create(data);
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
        this.validate(data);
        
        const now = new Date();

        const result = await sql`
          INSERT INTO news (
            title, description, content, url, "imageUrl", "publishedAt", "createdAt",
            "sourceName", author, provider
          ) VALUES (
            ${data.title}, ${data.description || null}, ${data.content}, 
            ${data.url || null}, ${data.imageUrl || null}, ${data.publishedAt || now}, ${now},
            ${data.sourceName || null}, ${data.author || null}, ${data.provider || 'newsapi'}
          )
          RETURNING *
        `;
        
        return result.rows[0];
      } catch (error) {
        throw createRepositoryError(error, 'create');
      }
    }

    /**
     * Find a news article by ID
     * @param {number} id - Article ID
     * @returns {Promise<Object|null>} Found article or null
     */
    async findById(id) {
      try {
        const result = await sql`
          SELECT * FROM news WHERE id = ${id} LIMIT 1
        `;
        return result.rows[0] || null;
      } catch (error) {
        throw createRepositoryError(error, 'findById');
      }
    }

    /**
     * Find news articles by provider
     * @param {string} provider - Provider name
     * @param {Object} [options] - Query options
     * @returns {Promise<Array>} List of articles
     */
    async findByProvider(provider, options = {}) {
      try {
        const { limit = 10, offset = 0 } = options;
        
        const result = await sql`
          SELECT * FROM news 
          WHERE provider = ${provider} 
          ORDER BY published_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `;
        
        return result.rows;
      } catch (error) {
        throw createRepositoryError(error, 'findByProvider');
      }
    }

    /**
     * Search news articles by query
     * @param {string} query - Search query
     * @param {Object} [options] - Query options
     * @returns {Promise<Array>} List of matching articles
     */
    async search(query, options = {}) {
      try {
        const { limit = 10, offset = 0 } = options;
        const searchTerm = `%${query}%`;
        
        const result = await sql`
          SELECT * FROM news 
          WHERE 
            title ILIKE ${searchTerm} OR
            description ILIKE ${searchTerm} OR
            content ILIKE ${searchTerm}
          ORDER BY published_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `;
        
        return result.rows;
      } catch (error) {
        throw createRepositoryError(error, 'search');
      }
    }

    /**
     * Update a news article
     * @param {number} id - Article ID
     * @param {Object} data - Data to update
     * @returns {Promise<Object>} Updated article
     */
    async update(id, data) {
      try {
        this.validate(data);
        
        const result = await sql`
          UPDATE news
          SET 
            title = COALESCE(${data.title}, title),
            description = COALESCE(${data.description}, description),
            content = COALESCE(${data.content}, content),
            url = COALESCE(${data.url}, url),
            image_url = COALESCE(${data.imageUrl}, image_url),
            published_at = COALESCE(${data.publishedAt}, published_at),
            source_name = COALESCE(${data.sourceName}, source_name),
            author = COALESCE(${data.author}, author),
            provider = COALESCE(${data.provider}, provider),
            updated_at = NOW()
          WHERE id = ${id}
          RETURNING *
        `;
        
        if (!result.rows.length) {
          throw new Error(`Article with ID ${id} not found`);
        }
        
        return result.rows[0];
      } catch (error) {
        throw createRepositoryError(error, 'update');
      }
    }

    /**
     * Delete a news article
     * @param {number} id - Article ID
     * @returns {Promise<boolean>} True if deleted, false otherwise
     */
    async delete(id) {
      try {
        const result = await sql`
          DELETE FROM news 
          WHERE id = ${id}
          RETURNING id
        `;
        
        return result.rows.length > 0;
      } catch (error) {
        throw createRepositoryError(error, 'delete');
      }
    }

    /**
 * Find all news articles matching criteria
 * @param {Object} criteria - Search criteria
 * @param {Object} options - Query options (limit, offset, order, etc.)
 * @returns {Promise<Array>} List of articles
 */
async findAll(criteria = {}, options = {}) {
  try {
    // Build query parts
    const whereParts = [];
    const values = [];
    let index = 1;
    
    // Process criteria
    Object.entries(criteria).forEach(([key, value]) => {
      // Handle special case for "provider" which we already have a dedicated method for
      if (key === 'provider') {
        whereParts.push(`provider = $${index}`);
        values.push(value);
        index++;
      } else {
        whereParts.push(`"${key}" = $${index}`);
        values.push(value);
        index++;
      }
    });
    
    // Construct WHERE clause
    const whereClause = whereParts.length > 0 ? `WHERE ${whereParts.join(' AND ')}` : '';
    
    // Handle ordering
    let orderClause = 'ORDER BY "publishedAt" DESC';
    if (options.order && options.order.length > 0) {
      const orderParts = options.order.map(([column, direction]) => 
        `"${column}" ${direction}`
      );
      orderClause = `ORDER BY ${orderParts.join(', ')}`;
    }
    
    // Handle pagination
    const limitClause = options.limit ? `LIMIT ${options.limit}` : '';
    const offsetClause = options.offset ? `OFFSET ${options.offset}` : '';
    
    // Execute the query
    const query = `
      SELECT * FROM news
      ${whereClause}
      ${orderClause}
      ${limitClause}
      ${offsetClause}
    `;
    
    const result = await sql.unsafe(query, values);
    return result;
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
      const whereParts = [];
      const values = [];
      let index = 1;
      
      Object.entries(criteria).forEach(([key, value]) => {
        whereParts.push(`"${key}" = $${index}`);
        values.push(value);
        index++;
      });
      
      const whereClause = whereParts.length > 0 ? `WHERE ${whereParts.join(' AND ')}` : '';
      
      const query = `SELECT COUNT(*) as count FROM news ${whereClause}`;
      const result = await sql.unsafe(query, values);
      
      return parseInt(result[0].count, 10);
    } catch (error) {
      throw createRepositoryError(error, 'count');
    }
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

    /**
     * Check if the database and required tables are accessible
     * @returns {Promise<boolean>} True if database is accessible and tables exist
     * @throws {Error} If database connection fails or tables don't exist
     */
    async checkConnection() {
      try {
        await sql`SELECT 1`;
        return true;
      } catch (error) {
        throw createRepositoryError(
          new Error('Database connection failed'), 
          'checkConnection'
        );
      }
    }
  }

  // Return an instance of the repository
  return new NeonNewsRepository();
}
