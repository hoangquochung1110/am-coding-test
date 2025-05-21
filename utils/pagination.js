// utils/pagination.js
import paginationConfig from '../config/pagination.js';

export function getPaginationParams(query = {}) {
  const page = parseInt(query.page, 10) || paginationConfig.defaultPage;
  const limit = Math.min(parseInt(query.limit, 10) || paginationConfig.defaultLimit, 
                         paginationConfig.maxLimit);
  const offset = query.page ? (page - 1) * limit : parseInt(query.offset, 10) || 0;
  
  return { page, limit, offset };
}

export function getPaginationMetadata(paginationParams, totalItems) {
  const { page, limit } = paginationParams;
  const totalPages = Math.ceil(totalItems / limit);
  
  return {
    totalItems,
    totalPages,
    currentPage: page,
    itemsPerPage: limit,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1
  };
}

export async function getPaginatedData(repository, criteria = {}, options = {}, queryParams = {}) {
    // Get pagination parameters
    const paginationParams = getPaginationParams(queryParams);
    
    // Execute both queries in parallel
    const [items, count] = await Promise.all([
      repository.findAll(criteria, {
        ...options,
        limit: paginationParams.limit,
        offset: paginationParams.offset
      }),
      repository.count(criteria)
    ]);
    
    // Get pagination metadata
    const paginationMeta = getPaginationMetadata(paginationParams, count);
    
    // Return data and pagination info
    return {
      items,
      pagination: paginationMeta
    };
  }