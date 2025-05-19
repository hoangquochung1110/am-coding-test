import BaseWeatherTransformer from '../../base/WeatherTransformer.js';

class AccuWeatherTransformer extends BaseWeatherTransformer {
    transform(data) {
        if (data.forecast) {
            return this._transformForecast(data);
        }
        return this._transformCurrent(data);
    }

    validate(data) {
        return data && 
            data.location && 
            (data.conditions || data.forecast);
    }

    _transformCurrent(data) {
        const { location, conditions } = data;
        const temp = conditions.Temperature?.Metric || conditions.Temperature?.Imperial;
        const feelsLike = conditions.RealFeelTemperature?.Metric || conditions.RealFeelTemperature?.Imperial;
        
        // Normalize location data using parent class method
        const normalizedLocation = this._normalizeLocation({
            ...location,
            Country: location.Country || { LocalizedName: '' }
        });
        
        return {
            // Provider information
            provider: 'accuweather',
            
            // Location data (normalized by parent class)
            ...normalizedLocation,
            
            // Required database fields
            latitude: location.GeoPosition?.Latitude || 0,
            longitude: location.GeoPosition?.Longitude || 0,
            
            // Temperature data
            temperature: this._getMetricValue(temp),
            feelsLike: this._getMetricValue(feelsLike),
            tempMin: this._getMetricValue(conditions.TemperatureSummary?.Past24HourRange?.Minimum?.Metric) || 0,
            tempMax: this._getMetricValue(conditions.TemperatureSummary?.Past24HourRange?.Maximum?.Metric) || 0,
            
            // Atmospheric conditions
            humidity: conditions.RelativeHumidity || 0,
            pressure: this._inchesToHPa(conditions.Pressure?.Imperial?.Value) || 0,
            
            // Wind data
            windSpeed: this._getMetricValue(conditions.Wind?.Speed?.Metric) || 0,
            windDirection: conditions.Wind?.Direction?.Degrees || 0,
            
            // Weather conditions
            conditionMain: conditions.WeatherText || '',
            conditionDescription: conditions.WeatherText || '',
            conditionIcon: String(conditions.WeatherIcon || '01').padStart(2, '0'),
            
            // Timestamp
            timestamp: conditions.EpochTime ? new Date(conditions.EpochTime * 1000) : new Date()
        };
    }

    _transformForecast(data) {
        const { location, forecast } = data;
        const dailyForecasts = forecast.DailyForecasts || [];
        
        // Normalize location data using parent class method
        const normalizedLocation = this._normalizeLocation({
            ...location,
            Country: location.Country || { LocalizedName: '' }
        });
        
        return {
            // Provider information
            provider: 'accuweather',
            
            // Location data (normalized by parent class)
            ...normalizedLocation,
            
            // Required database fields
            latitude: location.GeoPosition?.Latitude || 0,
            longitude: location.GeoPosition?.Longitude || 0,
            
            // Forecast data
            forecast: dailyForecasts.map(day => ({
                // Temperature data
                temperature: null,
                feelsLike: null,
                tempMin: this._fahrenheitToCelsius(day.Temperature?.Minimum?.Value || 0),
                tempMax: this._fahrenheitToCelsius(day.Temperature?.Maximum?.Value || 0),
                
                // Atmospheric conditions
                humidity: null,
                pressure: null,
                
                // Wind data
                windSpeed: this._mphToMetersPerSecond(day.Day?.Wind?.Speed?.Value || 0),
                windDirection: day.Day?.Wind?.Direction?.Degrees || 0,
                
                // Weather conditions
                conditionMain: day.Day?.IconPhrase || '',
                conditionDescription: day.Day?.LongPhrase || '',
                conditionIcon: String(day.Day?.Icon || '01').padStart(2, '0'),
                
                // Timestamp
                timestamp: new Date(day.EpochDate * 1000)
            }))
        };
    }

    // Helper methods for unit conversion
    _getMetricValue(metricObj) {
        if (!metricObj) return null;
        return typeof metricObj.Value === 'number' ? metricObj.Value : null;
    }

    _inchesToHPa(inches) {
        if (typeof inches !== 'number') return 0;
        return Math.round(inches * 33.8639); // Convert inHg to hPa/mb and round to nearest integer
    }

    _fahrenheitToCelsius(fahrenheit) {
        if (typeof fahrenheit !== 'number') return null;
        return (fahrenheit - 32) * 5/9;
    }

    _mphToMetersPerSecond(mph) {
        if (typeof mph !== 'number') return null;
        return mph * 0.44704;
    }
}

export default AccuWeatherTransformer;
