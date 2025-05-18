const database = require('./database');

const env = process.env.NODE_ENV || 'development';

const config = {
  env,
  port: process.env.PORT || 3000,
  database: database[env],
  // Add other configuration sections here as needed
};

module.exports = config;