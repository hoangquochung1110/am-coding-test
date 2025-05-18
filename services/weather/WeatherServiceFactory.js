import OpenWeatherMapService from './providers/openweathermap/index.js';
import AccuWeatherService from './providers/accuweather/index.js';

export const WeatherProvider = {
    OPENWEATHERMAP: 'openweathermap',
    ACCUWEATHER: 'accuweather'
};

class WeatherServiceFactory {
    static createWeatherService(provider, config) {
        switch (provider.toLowerCase()) {
            case WeatherProvider.OPENWEATHERMAP:
                return new OpenWeatherMapService(config.apiKey);
            case WeatherProvider.ACCUWEATHER:
                return new AccuWeatherService(config.apiKey);
            default:
                throw new Error(`Unsupported weather provider: ${provider}`);
        }
    }
}

export default WeatherServiceFactory;