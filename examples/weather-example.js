import { createWeatherService } from '../services/weather/index.js';
import { createWeatherRepository, RepositoryType } from '../repositories/weather/index.js';
import Weather from '../models/weather.js';
import database from '../config/database.js';
import 'dotenv/config';

// Weather Service Factory
class WeatherServiceFactory {
    static createService(provider, apiKey) {
        switch (provider) {
            case WeatherProvider.OPENWEATHERMAP:
                return createWeatherService(apiKey, WeatherProvider.OPENWEATHERMAP);
            case WeatherProvider.ACCUWEATHER:
                return createWeatherService(apiKey, WeatherProvider.ACCUWEATHER);
            default:
                throw new Error(`Unsupported weather provider: ${provider}`);
        }
    }
}

// Configuration for different weather providers
const WEATHER_PROVIDERS = [
    {
        name: 'OpenWeatherMap',
        provider: WeatherProvider.OPENWEATHERMAP,
        apiKey: process.env.OPENWEATHER_API_KEY
    },
    // {
    //     name: 'AccuWeather',
    //     provider: WeatherProvider.ACCUWEATHER,
    //     apiKey: process.env.ACCUWEATHER_API_KEY
    // }
];

// Initialize weather repository
const initializeRepository = async () => {
    return createWeatherRepository({
        type: RepositoryType.SEQUELIZE,
        config: {
            model: Weather
        }
    });
};

// Example of using weather services with factory pattern
const fetchAndCompareWeather = async (city) => {
    let weatherRepository;
    
    try {
        // Establish database connection
        console.log('Establishing database connection...');
        await database.sequelize.authenticate();
        console.log('Database connection has been established successfully.');
        
        // Initialize repository
        weatherRepository = await initializeRepository();
        
        console.log(`\nFetching weather for ${city} from all providers:\n`);
        
        // Process each provider
        for (const providerConfig of WEATHER_PROVIDERS) {
            try {
                console.log(`--- ${providerConfig.name} ---`);
                
                // Create service using factory
                const weatherService = WeatherServiceFactory.createService(
                    providerConfig.provider,
                    providerConfig.apiKey
                );
                
                // Fetch weather data
                const weatherData = await weatherService.getCurrentWeather(city);
                console.log(JSON.stringify(weatherData, null, 2));
                
                // Store in database
                try {
                    await weatherRepository.save(weatherData);
                    console.log('✅ Data saved to database\n');
                } catch (dbError) {
                    console.error(`❌ Database error: ${dbError.message}\n`);
                }
                
            } catch (error) {
                console.error(`❌ Error with ${providerConfig.name}: ${error.message}\n`);
            }
        }
        
    } catch (error) {
        console.error(`❌ Error in weather service comparison: ${error.message}`);
        process.exit(1);
    } finally {
        // Close the database connection when done
        if (database.sequelize) {
            console.log('Closing database connection...');
            await database.sequelize.close();
            console.log('Database connection closed.');
        }
    }
};

// Run the example
// fetchAndCompareWeather('Ho Chi Minh');