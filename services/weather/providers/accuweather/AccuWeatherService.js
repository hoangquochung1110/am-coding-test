import { WeatherService } from '../../base/index.js';
import AccuWeatherTransformer from './AccuWeatherTransformer.js';
import AccuWeatherApiClient from './AccuWeatherApiClient.js';

class AccuWeatherService extends WeatherService {
    constructor(apiKey) {
        const apiClient = new AccuWeatherApiClient(apiKey);
        const transformer = new AccuWeatherTransformer();
        super(apiClient, transformer);
    }

    async getCurrentWeather(city) {
        const data = await this.apiClient.getCurrentWeather(city);
        return this._standardizeWeatherData(data);
    }
}

export default AccuWeatherService;