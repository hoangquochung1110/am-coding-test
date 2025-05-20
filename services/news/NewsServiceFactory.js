import { NewsService } from './base/index.js';
import NewsApiService from './newsapi/index.js';

export const NewsProvider = {
    NEWSAPI: 'newsapi'
};

class NewsServiceFactory {
    static createNewsService(provider, config) {
        switch (provider.toLowerCase()) {
            case NewsProvider.NEWSAPI:
                return new NewsApiService(config.apiKey);
            default:
                return new NewsApiService(config.apiKey);
        }
    }
}

/**
 * Create a weather service instance for the specified provider
 * @param {string} apiKey - API key for the weather service
 * @param {string} provider - Weather service provider (default: 'openweathermap')
 * @returns {WeatherService} A weather service instance
 */
function createNewsService(apiKey, provider = NewsProvider.NEWSAPI) {
    return NewsServiceFactory.createNewsService(provider, { apiKey });
}

export { createNewsService };
