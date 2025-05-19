import { WeatherApiClient } from '../base/index.js';


class AccuWeatherApiClient extends WeatherApiClient {
    constructor(apiKey) {
        super('https://dataservice.accuweather.com', {
            params: {
                apikey: apiKey,
                details: true  // Get detailed weather information
            }
        });
    }

    async searchCity(city) {
        const [location] = await this.get('/locations/v1/cities/search', {
            q: city
        });
        
        if (!location) {
            throw new Error(`City not found: ${city}`);
        }
        
        return location;
    }

    async getCurrentConditions(locationKey) {
        const [conditions] = await this.get(`/currentconditions/v1/${locationKey}`, {
            params: {
                details: true  // Ensure we get detailed conditions including pressure
            }
        });
        return conditions;
    }

    async getCurrentWeather(city) {
        const location = await this.searchCity(city);
        const conditions = await this.getCurrentConditions(location.Key);
        
        return {
            location,
            conditions
        };
    }
}

export default AccuWeatherApiClient;