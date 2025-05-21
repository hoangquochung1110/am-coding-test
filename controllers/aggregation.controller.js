import { AggregationService } from '../services/aggregate/aggregation.service.js';

// Create a single instance of the service
const aggregationService = new AggregationService();

export class AggregationController {
  /**
   * Get aggregated data from all sources
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getAggregatedData(req, res) {
    try {
      // Use req.query instead of req.parsedQuery
      console.log("Query: ", req.query);
      const data = await aggregationService.getAggregatedData(req.query);
      
      // Check if we got valid data
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid data received from service');
      }

      return res.json({
        success: true,
        data: {
          news: Array.isArray(data.news) ? data.news : [],
          weather: data.weather && typeof data.weather === 'object' ? data.weather : {},
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
        // Include stack trace in development for debugging
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      });
    }
  }
}
