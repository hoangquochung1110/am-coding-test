import { Router } from 'express';
import { AggregationController } from '../controllers/aggregation.controller.js';
import { parseQuery } from '../middleware/queryParser.js';

const router = Router();

// Define query parameter schema
const aggregatedDataSchema = {
  // startDate: { type: 'date', required: true },
  // endDate: { type: 'date', default: new Date() },
  // location: { type: 'string' },
  // type: { type: 'string', default: 'weather' },
  city: { type: 'string', required: false },
  // days: { type: 'number', default: 5 },
  // units: { type: 'string', default: 'metric' }
};


// Health check route
router.get('/', (req, res) => {
  res.send('API is running');
});

// Aggregated data route
router.get('/aggregated-data', AggregationController.getAggregatedData);

export default router;
