import WeatherServiceFactory, { WeatherProvider } from './WeatherServiceFactory.js';

/**
 * Create a weather service instance for the specified provider
 * @param {string} apiKey - API key for the weather service
 * @param {string} provider - Weather service provider (default: 'openweathermap')
 * @returns {WeatherService} A weather service instance
 */
function createWeatherService(apiKey, provider = WeatherProvider.OPENWEATHERMAP) {
    return WeatherServiceFactory.createWeatherService(provider, { apiKey });
}

export { WeatherProvider };
export default createWeatherService;