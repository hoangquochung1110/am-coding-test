import { BaseTransformer } from '../../../../services/base/index.js';

class OpenWeatherMapTransformer extends BaseTransformer {
    transform(data) {
        if (data.list) {
            return this._transformForecast(data);
        }
        return this._transformCurrent(data);
    }

    validate(data) {
        if (data.list) {
            return data && 
                data.list && 
                data.list.length > 0 &&
                data.city &&
                data.list[0].main &&
                data.list[0].wind;
        }
        return data && 
            (data.weather || data.list) && 
            data.main && 
            data.wind;
    }

    _transformCurrent(data) {
        return {
            // Provider information
            provider: 'openweathermap',
            
            // Location data
            city: data.name,
            country: data.sys.country,
            latitude: data.coord.lat,
            longitude: data.coord.lon,
            
            // Temperature data
            temperature: data.main.temp,
            feelsLike: data.main.feels_like,
            tempMin: data.main.temp_min,
            tempMax: data.main.temp_max,
            
            // Atmospheric conditions
            humidity: data.main.humidity,
            pressure: data.main.pressure,
            
            // Wind data
            windSpeed: data.wind.speed,
            windDirection: data.wind.deg,
            
            // Weather conditions
            conditionMain: data.weather[0].main,
            conditionDescription: data.weather[0].description,
            conditionIcon: data.weather[0].icon,
            
            // Timestamp
            timestamp: new Date(data.dt * 1000)
        };
    }

    _transformForecast(data) {
        return {
            provider: 'openweathermap',
            city: data.city.name,
            country: data.city.country,
            latitude: data.city.coord.lat,
            longitude: data.city.coord.lon,
            forecast: data.list.map(item => ({
                // Temperature data
                temperature: item.main.temp,
                feelsLike: item.main.feels_like,
                tempMin: item.main.temp_min,
                tempMax: item.main.temp_max,
                
                // Atmospheric conditions
                humidity: item.main.humidity,
                pressure: item.main.pressure,
                
                // Wind data
                windSpeed: item.wind.speed,
                windDirection: item.wind.deg,
                
                // Weather conditions
                conditionMain: item.weather[0].main,
                conditionDescription: item.weather[0].description,
                conditionIcon: item.weather[0].icon,
                
                // Timestamp
                timestamp: new Date(item.dt * 1000)
            }))
        };
    }
}

export default OpenWeatherMapTransformer;
