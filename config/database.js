import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const env = process.env.NODE_ENV || 'development';

// Database configurations for different environments
const databaseConfig = {
  development: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    database: process.env.DB_NAME || 'development_db',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    dialect: 'postgres',
  },
  test: {
    host: process.env.TEST_DB_HOST || 'localhost',
    port: parseInt(process.env.TEST_DB_PORT, 10) || 5432,
    database: process.env.TEST_DB_NAME || 'test_db',
    username: process.env.TEST_DB_USER || 'postgres',
    password: process.env.TEST_DB_PASSWORD || 'postgres',
    dialect: 'postgres',
  },
  production: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    dialect: 'postgres',
    ssl: true,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};

// Get the correct environment configuration
const dbConfig = databaseConfig[env];

// Create Sequelize instance with the selected configuration
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    dialectOptions: dbConfig.dialectOptions,
    logging: console.log
  }
);

// Export the Sequelize instance for database operations
// and the config for reference
export default {
  sequelize,
  config: databaseConfig
};
