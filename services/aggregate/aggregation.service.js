import { Op } from "sequelize";
import { createNewsRepository } from '../../repositories/news/index.js';
import { createWeatherRepository, RepositoryType } from '../../repositories/weather/index.js';
import { Weather, News } from '../../models/index.js';
import { buildQueryOptions } from "../../middleware/queryBuilder.js";


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

  async getAggregatedData(query) {
    try {
      // Ensure repositories are initialized
      await this.ensureInitialized();

      const weather = await this.getAllWeather(query);
      const news = await this.getAllNews();
      return {
        news: news || [],
        weather: weather || {},
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error in AggregationService.getAggregatedData:', error);
      // Return empty data structure on error
      return {
        news: [],
        weather: {},
        timestamp: new Date().toISOString(),
        error: process.env.NODE_ENV === 'development' ? error.message : 'Failed to fetch data'
      };
    }
  }

  /**
   * Get latest news articles
   * @param {number} [limit=5] - Maximum number of articles to return
   * @returns {Promise<Array>} List of news articles
   */
  async getAllNews(limit = 5) {
    try {
      await this.ensureInitialized();
      const articles = await this.newsRepository.findByProvider("newsapi");
      
      // Ensure we return an array with proper formatting
      return Array.isArray(articles) 
        ? articles.map(article => ({
            title: article.title || '',
            description: article.description || '',
            url: article.url || '',
            imageUrl: article.imageUrl || '',
            publishedAt: article.publishedAt || new Date().toISOString(),
            sourceName: article.sourceName || '',
            author: article.author || ''
          }))
        : [];
    } catch (error) {
      console.error('Error fetching latest news:', error);
      return [];
    }
  }

  /**
   * Get weather data, optionally filtered by city
   * @param {string} [city] - Optional city name to filter by
   * @returns {Promise<Array>} List of weather data
   */
  async getAllWeather(query = {}) {
    try {
      await this.ensureInitialized();
  
      // Use the updated query builder with Django-style parameters
      const queryOptions = buildQueryOptions(query, Weather);
      console.log("Query Options: ", queryOptions);
      
      // Ensure we have at least an empty object for criteria
      const criteria = queryOptions.where || {};
      
      const weather = await this.weatherRepository.findAll(criteria);
      
      return Array.isArray(weather) 
        ? weather.map(record => ({
            city: record.city || '',
            temperature: record.temperature || 0,
            humidity: record.humidity || 0,
            timestamp: record.timestamp || new Date().toISOString()
          }))
        : [];
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return [];
    }
  }
}
