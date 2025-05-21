// middleware/queryBuilder.js
import { Op } from 'sequelize';

/**
 * Map of DRF-style lookup operators to Sequelize operators
 */
const LOOKUP_OPERATORS = {
  // Exact lookups
  'exact': Op.eq,
  'iexact': (val) => ({ [Op.iLike]: `^${val}$` }), // Regex-based case-insensitive exact match
  
  // Text lookups
  'contains': (val) => ({ [Op.like]: `%${val}%` }),
  'icontains': (val) => ({ [Op.iLike]: `%${val}%` }),
  'startswith': (val) => ({ [Op.like]: `${val}%` }),
  'istartswith': (val) => ({ [Op.iLike]: `${val}%` }),
  'endswith': (val) => ({ [Op.like]: `%${val}` }),
  'iendswith': (val) => ({ [Op.iLike]: `%${val}` }),
  
  // Numeric lookups
  'gt': Op.gt,
  'gte': Op.gte,
  'lt': Op.lt,
  'lte': Op.lte,
  
  // Date lookups
  'year': (val) => Sequelize.where(Sequelize.fn('EXTRACT', Sequelize.literal('YEAR FROM "createdAt"')), val),
  'month': (val) => Sequelize.where(Sequelize.fn('EXTRACT', Sequelize.literal('MONTH FROM "createdAt"')), val),
  'day': (val) => Sequelize.where(Sequelize.fn('EXTRACT', Sequelize.literal('DAY FROM "createdAt"')), val),
  
  // Boolean lookups
  'isnull': (val) => val ? { [Op.is]: null } : { [Op.not]: null },
  
  // Array lookups
  'in': Op.in,
  'between': Op.between
};

/**
 * Parse DRF-style field lookup
 * @param {string} param - Parameter like 'city__icontains'
 * @returns {Object} Parsed field and lookup info { field, lookupType, relation }
 */
function parseFieldLookup(param) {
  const parts = param.split('__');
  
  // Default case - just a field without operator
  if (parts.length === 1) {
    return {
      field: parts[0],
      lookupType: 'icontains', // Default to case-insensitive contains for string fields
      relation: null
    };
  }
  
  // Check if the last part is a lookup type
  const lastPart = parts[parts.length - 1];
  if (LOOKUP_OPERATORS[lastPart]) {
    return {
      field: parts.slice(0, -1).join('__'), // Could contain relation paths
      lookupType: lastPart,
      relation: parts.length > 2 ? parts.slice(0, -2).join('__') : null
    };
  }
  
  // If the last part isn't a lookup type, assume it's a field and use default lookup
  return {
    field: param,
    lookupType: 'icontains', // Default 
    relation: parts.length > 1 ? parts.slice(0, -1).join('__') : null
  };
}

/**
 * Build a Sequelize where clause from Django-style query parameters
 * @param {Object} queryParams - Query parameters (req.query)
 * @param {Model} model - Sequelize model
 * @returns {Object} Sequelize where clause
 */
export function buildWhereClause(queryParams, model) {
  if (!queryParams || typeof queryParams !== 'object') {
    return {};
  }
  
  const where = {};
  const includes = [];
  
  // Process each parameter
  Object.entries(queryParams).forEach(([param, value]) => {
    // Skip pagination, sorting parameters
    if (['limit', 'offset', 'sort'].includes(param)) {
      return;
    }
    
    // Parse the lookup
    const { field, lookupType, relation } = parseFieldLookup(param);
    
    // Get the operator
    const lookupOperator = LOOKUP_OPERATORS[lookupType];
    if (!lookupOperator) {
      console.warn(`Unsupported lookup type: ${lookupType}`);
      return;
    }
    
    // Handle relations (if any)
    if (relation) {
      // Process relations with Sequelize includes
      // This is more complex and would depend on your model associations
      console.warn('Relation lookups not fully implemented yet');
      return;
    }
    
    // Handle the value based on lookup type
    let transformedValue;
    if (typeof lookupOperator === 'function') {
      // Some operators need special handling
      transformedValue = lookupOperator(value);
    } else {
      // Simple operator mapping
      transformedValue = { [lookupOperator]: value };
    }
    
    // Add to where clause
    where[field] = transformedValue;
  });
  
  return where;
}

/**
 * Build complete query options including pagination, sorting
 * @param {Object} params - Query parameters
 * @param {Model} model - Sequelize model
 * @returns {Object} Sequelize query options
 */
export function buildQueryOptions(params, model) {
  if (!params || typeof params !== 'object') {
    return {};
  }
  
  const options = {};
  
  // Build where clause using Django-style lookups
  options.where = buildWhereClause(params, model);
  
  // Handle pagination
  if (params.limit) {
    options.limit = parseInt(params.limit, 10);
  }
  
  if (params.offset) {
    options.offset = parseInt(params.offset, 10);
  }
  
  // Handle sorting
  if (params.sort) {
    options.order = parseSort(params.sort);
  }
  
  return options;
}

/**
 * Parse sort parameter into Sequelize order array
 * @param {string} sort - Sort parameter like "name,-created_at"
 * @returns {Array} Sequelize order array
 */
function parseSort(sort) {
  if (!sort) return undefined;
  
  // Split by comma and process each field
  return sort.split(',').map(field => {
    if (field.startsWith('-')) {
      // Descending order
      return [field.substring(1), 'DESC'];
    }
    // Ascending order
    return [field, 'ASC'];
  });
}