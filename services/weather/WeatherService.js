import { BaseApiClient, BaseTransformer } from '../base/index.js';

/**
 * Abstract Weather Service that defines the interface for all weather providers
 */
class WeatherService {
    /**
     * @param {BaseApiClient} apiClient - HTTP client for making API requests
     * @param {BaseTransformer} transformer - Data transformer for standardizing responses
     */
    constructor(apiClient, transformer) {
        if (!(apiClient instanceof BaseApiClient)) {
            throw new Error('apiClient must be an instance of BaseApiClient');
        }
        if (!(transformer instanceof BaseTransformer)) {
            throw new Error('transformer must be an instance of BaseTransformer');
        }
        this.apiClient = apiClient;
        this.transformer = transformer;
    }

    /**
     * Get current weather for a location
     * @param {string} city - City name
     * @returns {Promise<Object>} Weather data
     */
    async getCurrentWeather(city) {
        throw new Error('getCurrentWeather() must be implemented');
    }

    /**
     * Get weather forecast for a location
     * @param {string} city - City name
     * @returns {Promise<Object>} Forecast data
     */
    async getForecast(city) {
        throw new Error('getForecast() must be implemented');
    }

    /**
     * Standardize weather data format across different providers
     * @param {Object} data - Raw weather data from provider
     * @returns {Object} Standardized weather data
     * @protected
     */
    _standardizeWeatherData(data) {
        return this.transformer.normalize(data);
    }

    /**
     * Standardize forecast data format across different providers
     * @param {Object} data - Raw forecast data from provider
     * @returns {Object} Standardized forecast data
     * @protected
     */
    _standardizeForecastData(data) {
        return this.transformer.normalize(data);
    }
}

export default WeatherService;