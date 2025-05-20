// worker.js
import { createWeatherService } from './services/weather/index.js';
import { createWeatherRepository, RepositoryType } from './repositories/weather/index.js';
import { createNewsRepository } from './repositories/news/index.js';
import { createNewsService } from './services/news/index.js';


/**
 * Create a database connection string from environment variables
 * @param {Object} env - Environment variables
 * @returns {string} Connection string
 */
function getDatabaseUrl(env) {
  return `postgres://${env.DB_USER}:${env.DB_PASSWORD}@${env.DB_HOST}/${env.DB_NAME}?sslmode=require`;
}

/**
 * Create repository instance
 * @param {Object} env - Environment variables
 * @returns {Promise<Object>} Repository instance
 */
async function initWeatherRepository(env) {
  // Create the repository instance with Neon configuration
  const weatherRepository = await createWeatherRepository({
    type: RepositoryType.NEON,
    config: {
      connectionString: getDatabaseUrl(env)
    }
  });
  
  // Verify database connection and that the table exists
  await weatherRepository.checkConnection();
  console.log('Successfully connected to weather database');
  
  return weatherRepository;
}

async function initNewsRepository(env) {
  // Create the repository instance with Neon configuration
  const newsRepository = await createNewsRepository({
    type: RepositoryType.NEON,
    config: {
      connectionString: getDatabaseUrl(env)
    }
  });
  
  // Verify database connection and that the table exists
  await newsRepository.checkConnection();
  console.log('Successfully connected to news database');
  
  return newsRepository;
}

async function fetchData(env) {
  try {

    const CITIES = env.CITIES ? env.CITIES.split(',') : ['Ho Chi Minh'];

    // Create the weather service using the API key from environment
    const weatherService = createWeatherService(env.OPENWEATHERMAP_API_KEY);
    const newsService = new createNewsService(env.NEWSAPI_API_KEY);

    // Initialize repositories
    const weatherRepository = await initWeatherRepository(env);
    const newsRepository = await initNewsRepository(env);
    
    // Fetch weather for each city
    const results = await Promise.all(
      CITIES.map(async (city) => {
        try {
          // Fetch weather data
          const weatherData = await weatherService.getCurrentWeather(city);
          
          // Save to database
          const record = await weatherRepository.save(weatherData);
          console.log(`Saved weather data for ${city}: `, record)
          
          // Add database operation result to the response
          return { 
            city, 
            success: true, 
            data: weatherData,
            recordId: record.id
          };
        } catch (error) {
          console.error(`Error processing ${city}:`, error);
          return { city, success: false, error: error.message };
        }
      })
    );
    
    // Log results (for the POC)
    console.log('Weather data fetch results:', JSON.stringify(results, null, 2));

    const topHeadlines = await newsService.getTopHeadlines({ 
      country: 'us',
      category: 'technology'
    });
  
    // Save headlines to database
    for (const article of topHeadlines.articles) {
        try {
            const savedArticle = await newsRepository.create({
                title: article.title,
                description: article.description || '',
                content: article.content || '',
                url: article.url,
                imageUrl: article.imageUrl || '', 
                publishedAt: article.publishedAt,
                sourceName: article.sourceName,
                author: article.author || '',
                provider: 'newsapi'
            });
            console.log(`Successfully saved article: ${savedArticle.title}`);
        } catch (error) {
            console.error(`Error saving article: ${error.message}`);
        }
    }

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
        const results = await fetchData(env);
        return new Response(JSON.stringify(results, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      }
      
      // Default response with simple documentation
      return new Response(
        "Weather Fetcher Worker\n\n" +
        "Available endpoints:\n" +
        "- /trigger-fetch: Manually trigger weather data update", 
        {
          headers: { "Content-Type": "text/plain" }
        }
      );
    } catch (error) {
      console.error("API request error:", error);
      return new Response(`Error: ${error.message}`, { status: 500 });
    }
  },
  
  // Scheduled handler for cron jobs
  async scheduled(event, env, ctx) {
    try {
      const results = await fetchData(env);
      return new Response("Weather data retrieved and saved successfully", { status: 200 });
    } catch (error) {
      console.error("Scheduled job error:", error);
      return new Response(`Error: ${error.message}`, { status: 500 });
    }
  }
};
