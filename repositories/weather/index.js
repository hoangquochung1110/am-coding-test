import WeatherRepositoryInterface from './interface.js';
import SequelizeWeatherRepository from './sequelize.js';
import NeonWeatherRepository from './neon.js';

/**
 * WeatherRepository Factory
 * Creates the appropriate WeatherRepository implementation based on environment and configuration
 */
/**
 * Create a weather repository instance
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.type - Repository type ('sequelize' or 'neon')
 * @param {Object} options.config - Implementation-specific configuration
 * 
 * For Sequelize:
 * @param {Object} options.config.model - Sequelize Weather model
 * 
 * For Neon:
 * @param {string} options.config.connectionString - Database connection string
 * @param {Object} options.config.connection - Or individual connection parameters
 * 
 * @returns {WeatherRepositoryInterface} Repository implementation
 * @throws {Error} If invalid repository type or missing configuration
 */
export async function createWeatherRepository(options) {
  const { type, config = {} } = options;
  
  // Validate inputs
  if (!type) {
    throw new Error('Repository type is required');
  }
  
  // Dynamically load the appropriate implementation
  try {
    let RepositoryImplementation;
    
    switch (type.toLowerCase()) {
      case RepositoryType.SEQUELIZE:
        // Dynamically import Sequelize implementation
        const { default: SequelizeWeatherRepository } = await import(
          './sequelize.js'
        );
        RepositoryImplementation = SequelizeWeatherRepository;
        
        // Validate Sequelize-specific config
        if (!config.model) {
          throw new Error('Sequelize repository requires a model configuration');
        }
        break;
        
      case RepositoryType.NEON:
        // Dynamically import Neon implementation
        const { default: NeonWeatherRepository } = await import(
          './neon.js'
        );
        RepositoryImplementation = NeonWeatherRepository;
        
        // Validate Neon-specific config
        if (!config.connectionString && !config.connection) {
          throw new Error('Neon repository requires either connectionString or connection parameters');
        }
        break;
        
      default:
        throw new Error(`Unsupported repository type: ${type}`);
    }
    
    // Create and return the repository instance
    const repository = new RepositoryImplementation(config);
    
    // Verify it implements the interface
    validateRepositoryImplementation(repository);
    
    return repository;
  } catch (error) {
    throw new Error(`Failed to create repository: ${error.message}`);
  }
}

/**
 * Auto-detect environment and create appropriate repository
 * @param {Object} config - Configuration options
 * @returns {WeatherRepositoryInterface} Repository implementation
 */
export async function createWeatherRepositoryForEnvironment(config = {}) {
  // Detect if running in Cloudflare Worker environment
  const isWorkerEnvironment = typeof globalThis.caches !== 'undefined' && 
                             typeof globalThis.fetch === 'function' &&
                             typeof process === 'undefined';
  
  if (isWorkerEnvironment) {
    return createWeatherRepository({
      type: RepositoryType.NEON,
      config
    });
  } else {
    return createWeatherRepository({
      type: RepositoryType.SEQUELIZE,
      config
    });
  }
}

/**
 * Validate that repository implements all required methods
 * @param {Object} repository - Repository instance to validate
 * @throws {Error} If implementation is missing required methods
 */
function validateRepositoryImplementation(repository) {
  // Get all method names from the interface (excluding constructor)
  const requiredMethods = Object.getOwnPropertyNames(WeatherRepositoryInterface.prototype)
    .filter(name => name !== 'constructor');
  
  // Verify each method exists on the implementation
  for (const method of requiredMethods) {
    if (typeof repository[method] !== 'function') {
      throw new Error(`Repository implementation missing required method: ${method}`);
    }
  }
}
  
// Repository implementation types
export const RepositoryType = {
    SEQUELIZE: 'sequelize',
    NEON: 'neon'
  };
