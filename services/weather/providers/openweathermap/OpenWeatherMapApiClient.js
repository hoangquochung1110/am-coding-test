import { BaseApiClient } from '../../../../services/base/index.js';

import axios from 'axios';

class OpenWeatherMapApiClient extends BaseApiClient {
    constructor(apiKey) {
        super('https://api.openweathermap.org/data/2.5', {
            params: {
                appid: apiKey,
                units: 'metric'
            }
        });
        this.apiKey = apiKey;
    }

    async getCoordinates(city) {
        const response = await axios.get('https://api.openweathermap.org/geo/1.0/direct', {
            params: {
                q: city,
                limit: 1,
                appid: this.apiKey
            }
        });
        
        if (!response.data || response.data.length === 0) {
            throw new Error(`City "${city}" not found`);
        }

        const { lat, lon } = response.data[0];
        return { lat, lon };
    }

    async getCurrentWeather(city) {
        const coords = await this.getCoordinates(city);
        return this.client.get('/weather', {
            params: {
                lat: coords.lat,
                lon: coords.lon
            }
        });
    }

    async getForecast(city) {
        const coords = await this.getCoordinates(city);
        return this.client.get('/forecast', {
            params: {
                lat: coords.lat,
                lon: coords.lon
            }
        });
    }
}

export default OpenWeatherMapApiClient;