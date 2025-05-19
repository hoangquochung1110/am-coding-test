import { WeatherApiClient } from '../base/index.js';

class OpenWeatherMapApiClient extends WeatherApiClient {
    constructor(apiKey) {
        super('https://api.openweathermap.org/data/2.5', {
            params: {
                appid: apiKey,
                units: 'metric'
            }
        });
        this.apiKey = apiKey;
    }

    async getCurrentWeather(city) {
        return this.get(
            '/weather',
            {
                q: city,
            }
        );
    }

    async getForecast(city) {
        return this.get(
            '/forecast',
            {
                q: city,
            }
        );
    }
}

export default OpenWeatherMapApiClient;