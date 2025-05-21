import { AggregationService } from '../services/aggregate/aggregation.service.js';

// Create a single instance of the service
const aggregationService = new AggregationService();

export class AggregationController {
  static async getAggregatedData(req, res) {
    try {
      // Log the query parameters for debugging
      console.log("Query parameters:", req.query);
      
      // Pass the query parameters to the service
      const data = await aggregationService.getAggregatedData(req.query);
      
      // Check if we got valid data
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid data received from service');
      }

      // Return a structured response that includes pagination metadata
      return res.json({
        success: true,
        data: {
          news: {
            items: data.news.items || [],
            pagination: data.news.pagination || {}
          },
          weather: {
            items: data.weather.items || [],
            pagination: data.weather.pagination || {}
          },
          timestamp: data.timestamp || new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error in AggregationController:', error);
      
      // Return a consistent error response
      const statusCode = error.statusCode || 500;
      const errorMessage = process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Failed to fetch aggregated data';
      
      return res.status(statusCode).json({
        success: false,
        message: 'Failed to process your request',
        error: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      });
    }
  }
}