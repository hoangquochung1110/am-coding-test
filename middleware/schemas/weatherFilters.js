/**
 * Schema definition for weather data filters
 */
export default {
    city: { 
      type: 'string', 
      required: false,
      description: 'Filter by city name'
    },
    country: { 
      type: 'string', 
      required: false,
      description: 'Filter by country code'
    },
    provider: { 
      type: 'string', 
      required: false, 
      allowed: ['openweathermap', 'accuweather'],
      description: 'Filter by weather data provider'
    },
    minTemperature: { 
      type: 'number', 
      required: false,
      description: 'Filter by minimum temperature (°C)'
    },
    maxTemperature: { 
      type: 'number', 
      required: false,
      description: 'Filter by maximum temperature (°C)'
    },
    fromDate: { 
      type: 'date', 
      required: false,
      description: 'Filter by records after this date'
    },
    toDate: { 
      type: 'date', 
      required: false,
      description: 'Filter by records before this date'
    }
  };
  