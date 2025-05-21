import { Op } from "sequelize";
import { createNewsRepository } from '../../repositories/news/index.js';
import { createWeatherRepository, RepositoryType } from '../../repositories/weather/index.js';
import { Weather, News } from '../../models/index.js';
import { buildQueryOptions } from "../../middleware/queryBuilder.js";
import { getPaginatedData } from "../../utils/pagination.js";

/**
 * Service for aggregating data from different sources
 */
export class AggregationService {
  constructor() {
    // Initialize repositories asynchronously
    this.initialized = this.initializeRepositories();
  }

  /**
   * Initialize repository instances
   * @private
   */
  async initializeRepositories() {
    try {
      const [newsRepo, weatherRepo] = await Promise.all([
        createNewsRepository({
          type: RepositoryType.SEQUELIZE,
          config: {
              model: News
          }
        }),
        createWeatherRepository({
        type: RepositoryType.SEQUELIZE,
        config: {
            model: Weather
        }
      })
      ]);
      
      this.newsRepository = newsRepo;
      this.weatherRepository = weatherRepo;
      
      console.log('Repositories initialized successfully');
    } catch (error) {
      console.error('Failed to initialize repositories:', error);
      throw new Error(`Failed to initialize repositories: ${error.message}`);
    }
  }
  
  /**
   * Ensure repositories are initialized before use
   * @private
   */
  async ensureInitialized() {
    if (!this.newsRepository || !this.weatherRepository) {
      await this.initialized;
    }
  }

  /**
   * Get aggregated data with pagination
   * @param {Object} query - Query parameters including pagination and filters
   * @returns {Promise<Object>} Aggregated data with pagination metadata
   */
  async getAggregatedData(query = {}) {
    try {
      // Ensure repositories are initialized
      await this.ensureInitialized();

      // Extract filter parameters
      const { city, country, provider, ...paginationParams } = query;
      
      // Create filter object
      const filters = {};
      if (city) filters.city = city;
      if (country) filters.country = country;
      if (provider) filters.provider = provider;

      // Fetch paginated weather and news data in parallel
      const [weather, news] = await Promise.all([
        this.getPaginatedWeather(filters, paginationParams),
        this.getPaginatedNews(paginationParams)
      ]);

      return {
        news,
        weather,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error in AggregationService.getAggregatedData:', error);
      // Return empty data structure on error
      return {
        news: { items: [], pagination: {} },
        weather: { items: [], pagination: {} },
        timestamp: new Date().toISOString(),
        error: process.env.NODE_ENV === 'development' ? error.message : 'Failed to fetch data'
      };
    }
  }

  /**
   * Get paginated news data
   * @param {Object} paginationParams - Pagination parameters (page, limit)
   * @returns {Promise<Object>} News data with pagination metadata
   */
  async getPaginatedNews(paginationParams = {}) {
    try {
      await this.ensureInitialized();
      
      // Use the pagination utility to get paginated data
      const result = await getPaginatedData(
        this.newsRepository,
        { provider: "newsapi" }, // Filter criteria
        { order: [['publishedAt', 'DESC']] }, // Options
        paginationParams // Pagination parameters
      );
      
      // Transform the data as needed
      const transformedItems = result.items.map(article => ({
        title: article.title || '',
        description: article.description || '',
        url: article.url || '',
        imageUrl: article.imageUrl || '',
        publishedAt: article.publishedAt || new Date().toISOString(),
        sourceName: article.sourceName || '',
        author: article.author || ''
      }));
      
      return {
        items: transformedItems,
        pagination: result.pagination
      };
    } catch (error) {
      console.error('Error fetching paginated news:', error);
      return { items: [], pagination: {} };
    }
  }

  /**
   * Get paginated weather data
   * @param {Object} filters - Filter criteria
   * @param {Object} paginationParams - Pagination parameters
   * @returns {Promise<Object>} Weather data with pagination metadata
   */
  async getPaginatedWeather(filters = {}, paginationParams = {}) {
    try {
      await this.ensureInitialized();
      
      // Convert query parameters to Sequelize criteria using existing utility
      const queryOptions = buildQueryOptions(filters, Weather);
      const criteria = queryOptions.where || {};
      
      // Use the pagination utility to get paginated data
      const result = await getPaginatedData(
        this.weatherRepository,
        criteria,
        { order: [['timestamp', 'DESC']] },
        paginationParams
      );
      
      // Transform the data as needed
      const transformedItems = result.items.map(record => ({
        city: record.city || '',
        temperature: record.temperature || 0,
        humidity: record.humidity || 0,
        timestamp: record.timestamp || new Date().toISOString()
      }));
      
      return {
        items: transformedItems,
        pagination: result.pagination
      };
    } catch (error) {
      console.error('Error fetching paginated weather:', error);
      return { items: [], pagination: {} };
    }
  }

  // For backwards compatibility, maintain the old methods but use the new ones
  async getAllNews(limit = 5) {
    const result = await this.getPaginatedNews({ limit });
    return result.items;
  }

  async getAllWeather(query = {}) {
    const result = await this.getPaginatedWeather(query, query);
    return result.items;
  }
}
