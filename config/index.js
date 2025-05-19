// config/index.js
import database from './database.js';

const env = process.env.NODE_ENV || 'development';

const config = {
  env,
  port: process.env.PORT || 3000,
  database: database.config[env],
  // Add other configuration sections here as needed
};

export default config;