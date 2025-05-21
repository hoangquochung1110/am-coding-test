// middlewares/queryParser.js
import { Op } from 'sequelize';

// Map of operation names to Sequelize operators
const OperatorMap = {
  eq: Op.eq,
  ne: Op.ne,
  gt: Op.gt,
  gte: Op.gte,
  lt: Op.lt,
  lte: Op.lte,
  like: Op.like,
  ilike: Op.iLike,
  in: Op.in,
  between: Op.between
};

export function parseQuery(schema, options = {}) {
  return (req, res, next) => {
    try {
      // Initialize parsed query objects
      const parsedQuery = {};
      
      // Handle filters if they exist
      if (req.query.filters) {
        parsedQuery.filters = parseFilters(req.query.filters, schema);
      } else {
        // If no filters object, look for direct field queries
        parsedQuery.filters = parseDirectParams(req.query, schema);
      }
      
      // Handle pagination
      if (req.query.limit !== undefined) {
        parsedQuery.limit = parseInt(req.query.limit, 10);
      }
      
      if (req.query.offset !== undefined) {
        parsedQuery.offset = parseInt(req.query.offset, 10);
      }
      
      // Handle sorting
      if (req.query.sort) {
        parsedQuery.sort = parseSorting(req.query.sort);
      }
      
      // Apply defaults for unspecified required fields
      applyDefaults(parsedQuery.filters, schema);
      
      // Validate required fields
      validateRequired(parsedQuery.filters, schema);
      
      // Store parsed query in request
      req.parsedQuery = parsedQuery;
      next();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
}

// Parse filter objects with operations (like, gt, eq, etc.)
function parseFilters(filters, schema) {
  const parsedFilters = {};
  
  // Process each field in the filters object
  for (const [field, filter] of Object.entries(filters)) {
    // Skip fields not in schema unless allowExtraFields is true
    if (!schema[field]) continue;
    
    // For simple value (equality filter)
    if (typeof filter !== 'object') {
      parsedFilters[field] = convertType(filter, schema[field].type);
      continue;
    }
    
    // For operation-based filters (like, gt, etc.)
    parsedFilters[field] = {};
    
    for (const [op, value] of Object.entries(filter)) {
      // Skip unsupported operators
      if (!OperatorMap[op.toLowerCase()]) continue;
      
      // Handle special case for 'between'
      if (op.toLowerCase() === 'between' && Array.isArray(value)) {
        parsedFilters[field][OperatorMap[op.toLowerCase()]] = [
          convertType(value[0], schema[field].type),
          convertType(value[1], schema[field].type)
        ];
        continue;
      }
      
      // Handle 'in' operator
      if (op.toLowerCase() === 'in' && Array.isArray(value)) {
        parsedFilters[field][OperatorMap[op.toLowerCase()]] = 
          value.map(v => convertType(v, schema[field].type));
        continue;
      }
      
      // Convert value based on field type
      parsedFilters[field][OperatorMap[op.toLowerCase()]] = 
        convertType(value, schema[field].type);
    }
    
    // If no valid operations were found, remove the field
    if (Object.keys(parsedFilters[field]).length === 0) {
      delete parsedFilters[field];
    }
  }
  
  return parsedFilters;
}

// Parse direct query parameters (for simpler queries)
function parseDirectParams(query, schema) {
  const parsedFilters = {};
  
  for (const [key, config] of Object.entries(schema)) {
    if (query[key] !== undefined) {
      parsedFilters[key] = convertType(query[key], config.type);
    }
  }
  
  return parsedFilters;
}

// Parse sorting parameters
function parseSorting(sort) {
  if (Array.isArray(sort)) {
    return sort;
  }
  
  if (typeof sort === 'string') {
    // Handle simple string format like "field:direction"
    const [field, direction] = sort.split(':');
    return [[field, direction.toUpperCase()]];
  }
  
  return null;
}

// Apply default values for unspecified fields
function applyDefaults(filters, schema) {
  for (const [field, config] of Object.entries(schema)) {
    if (filters[field] === undefined && 'default' in config) {
      filters[field] = config.default;
    }
  }
}

// Validate required fields
function validateRequired(filters, schema) {
  for (const [field, config] of Object.entries(schema)) {
    if (config.required && filters[field] === undefined) {
      throw new Error(`Missing required query parameter: ${field}`);
    }
  }
}

// Convert value to specified type
function convertType(value, type) {
  if (value === undefined || value === null) {
    return value;
  }
  
  switch (type) {
    case 'number':
      return Number(value);
    case 'boolean':
      return value === true || value === 'true';
    case 'date':
      return new Date(value);
    case 'array':
      return Array.isArray(value) ? value : [value];
    default:
      return value;
  }
}
