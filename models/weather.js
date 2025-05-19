// models/weather.js
import { DataTypes } from 'sequelize';
import db from '../config/database.js';
const { sequelize } = db;

const Weather = sequelize.define('Weather', {
  // Location data
  city: {
    type: DataTypes.STRING,
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
    type: DataTypes.STRING,
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
    allowNull: false
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