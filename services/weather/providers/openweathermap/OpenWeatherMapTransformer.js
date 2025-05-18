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
            // Forecast data validation
            return data && 
                data.list && 
                data.list.length > 0 &&
                data.city &&
                data.list[0].main &&
                data.list[0].wind;
        }
        // Current weather validation
        return data && 
            (data.weather || data.list) && 
            data.main && 
            data.wind;
    }

    _transformCurrent(data) {
        return {
            location: {
                city: data.name,
                country: data.sys.country,
                coordinates: {
                    lat: data.coord.lat,
                    lon: data.coord.lon
                }
            },
            temperature: {
                current: data.main.temp,
                feelsLike: data.main.feels_like,
                min: data.main.temp_min,
                max: data.main.temp_max
            },
            humidity: data.main.humidity,
            pressure: data.main.pressure,
            wind: {
                speed: data.wind.speed,
                direction: data.wind.deg
            },
            conditions: {
                main: data.weather[0].main,
                description: data.weather[0].description,
                icon: data.weather[0].icon
            },
            timestamp: new Date(data.dt * 1000)
        };
    }

    _transformForecast(data) {
        return {
            location: {
                city: data.city.name,
                country: data.city.country,
                coordinates: {
                    lat: data.city.coord.lat,
                    lon: data.city.coord.lon
                }
            },
            forecast: data.list.map(item => ({
                temperature: {
                    current: item.main.temp,
                    feelsLike: item.main.feels_like,
                    min: item.main.temp_min,
                    max: item.main.temp_max
                },
                humidity: item.main.humidity,
                pressure: item.main.pressure,
                wind: {
                    speed: item.wind.speed,
                    direction: item.wind.deg
                },
                conditions: {
                    main: item.weather[0].main,
                    description: item.weather[0].description,
                    icon: item.weather[0].icon
                },
                timestamp: new Date(item.dt * 1000)
            }))
        };
    }
}

export default OpenWeatherMapTransformer;