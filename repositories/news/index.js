import { NewsRepository } from './interface.js';

/**
 * Supported repository types
 */
export const RepositoryType = Object.freeze({
  SEQUELIZE: 'sequelize',
  NEON: 'neon'
});

/**
 * Validates that a repository implementation adheres to the NewsRepository interface
 * @param {NewsRepository} implementation - The implementation to validate
 * @throws {Error} If the implementation is invalid
 */
function validateRepositoryImplementation(implementation) {
  if (!(implementation instanceof NewsRepository)) {
    throw new Error('Repository must extend NewsRepository');
  }
  
  const requiredMethods = [
    'create', 'findById', 'findByProvider', 'search', 'update', 'delete', 'validate'
  ];
  
  for (const method of requiredMethods) {
    if (typeof implementation[method] !== 'function') {
      throw new Error(`Repository implementation missing required method: ${method}`);
    }
  }
}

/**
 * Factory function to create a news repository instance
 * @param {Object} options - Configuration options
 * @param {string} options.type - Type of repository to create (sequelize, neon)
 * @param {Object} options.config - Configuration specific to the repository type
 * @returns {Promise<NewsRepository>} A repository instance that implements NewsRepository interface
 * @throws {Error} If the repository cannot be created
 */
export async function createNewsRepository({ type, config = {} } = {}) {
  if (!type) {
    throw new Error('Repository type is required');
  }

  try {
    let repository;
    
    switch (type.toLowerCase()) {
      case RepositoryType.SEQUELIZE: {
        const { default: createSequelizeRepository } = await import('./sequelize.js');
        repository = createSequelizeRepository(config);
        break;
      }
        
      case RepositoryType.NEON: {
        const { default: createNeonRepository } = await import('./neon.js');
        repository = createNeonRepository(config);
        break;
      }
        
      default:
        throw new Error(`Unsupported repository type: ${type}`);
    }
    
    validateRepositoryImplementation(repository);
    return repository;
    
  } catch (error) {
    console.error('Failed to create repository:', error);
    throw new Error(`Failed to create repository: ${error.message}`);
  }
}

/**
 * Auto-detect environment and create appropriate repository
 * @param {Object} [config] - Configuration options
 * @returns {Promise<NewsRepository>} Repository implementation
 */
export async function createNewsRepositoryForEnvironment(config = {}) {
  // In a real app, you might detect environment here
  // For now, default to Sequelize for server-side
  return createNewsRepository({
    type: RepositoryType.SEQUELIZE,
    config
  });
}
