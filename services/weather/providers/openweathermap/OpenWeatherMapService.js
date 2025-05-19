import { WeatherService } from '../../base/index.js';
import OpenWeatherMapTransformer from './OpenWeatherMapTransformer.js';
import OpenWeatherMapApiClient from './OpenWeatherMapApiClient.js';

class OpenWeatherMapService extends WeatherService {
    constructor(apiKey) {
        const apiClient = new OpenWeatherMapApiClient(apiKey);
        const transformer = new OpenWeatherMapTransformer();
        super(apiClient, transformer);
    }

    async getCurrentWeather(city) {
        const data = await this.apiClient.getCurrentWeather(city);
        return this._standardizeWeatherData(data);
    }

    async getForecast(city) {
        const data = await this.apiClient.getForecast(city);
        return this._standardizeForecastData(data);
    }
}

export default OpenWeatherMapService;