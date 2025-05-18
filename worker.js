import createWeatherService, { WeatherProvider } from './services/weather/index.js';

// Define the cities you want to fetch weather for
const CITIES = ['Singapore', 'London', 'New York'];

async function fetchWeatherData(env) {
  try {
    // Create the weather service using the API key from environment
    const weatherService = createWeatherService(env.OPENWEATHERMAP_API_KEY);
    // Fetch weather for each city
    const results = await Promise.all(
      CITIES.map(async (city) => {
        try {
          const data = await weatherService.getCurrentWeather(city);
          return { city, success: true, data };
        } catch (error) {
          return { city, success: false, error: error.message };
        }
      })
    );
    
    // Log results (for the POC)
    console.log('Weather data fetch results:', JSON.stringify(results, null, 2));
    
    return results;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    throw error;
  }
}

export default {
  // Required fetch handler for HTTP requests
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      
      // Add a simple endpoint to manually trigger the weather fetch
      if (url.pathname === "/trigger-fetch") {
        const results = await fetchWeatherData(env);
        return new Response(JSON.stringify(results, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      }
      
      // Default response
      return new Response("Weather Fetcher Worker. Use /trigger-fetch to manually run the job.", {
        headers: { "Content-Type": "text/plain" }
      });
    } catch (error) {
      return new Response(`Error: ${error.message}`, { status: 500 });
    }
  },
  
  // Scheduled handler for cron jobs
  async scheduled(event, env, ctx) {
    try {
      const results = await fetchWeatherData(env);
      return new Response("Weather data retrieved successfully", { status: 200 });
    } catch (error) {
      return new Response(`Error: ${error.message}`, { status: 500 });
    }
  }
};