// models/weather.js
import { DataTypes } from 'sequelize';
import db from '../config/database.js';
const { sequelize } = db;

const Weather = sequelize.define('Weather', {
  // Provider information
  provider: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notNull: { msg: 'Provider is required' },
      notEmpty: { msg: 'Provider cannot be empty' },
      isIn: {
        args: [['openweathermap', 'accuweather']],
        msg: 'Invalid provider specified'
      }
    }
  },
  
  // Location data
  city: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false
  },
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  
  // Temperature data
  temperature: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  feelsLike: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  tempMin: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  tempMax: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  
  // Atmospheric conditions
  humidity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  pressure: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  
  // Wind data
  windSpeed: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  windDirection: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  
  // Weather conditions
  conditionMain: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  conditionDescription: {
    type: DataTypes.STRING,
    allowNull: false
  },
  conditionIcon: {
    type: DataTypes.STRING,
    allowNull: false
  },
  
  // Timestamp of the weather reading
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      notNull: { msg: 'Timestamp is required' },
      isDate: { msg: 'Invalid date format for timestamp' },
      isAfter: {
        args: '1970-01-01',
        msg: 'Timestamp must be after 1970'
      },
      isBefore: {
        args: new Date(Date.now() + 86400000).toISOString(), // 1 day in future max
        msg: 'Timestamp cannot be in the far future'
      }
    }
  }
}, {
  // Table configuration options
  tableName: 'weather',
  indexes: [
    // Create index on city for faster lookups
    {
      fields: ['city']
    },
    // Create index on timestamp for time-based queries
    {
      fields: ['timestamp']
    }
  ]
});

export default Weather;