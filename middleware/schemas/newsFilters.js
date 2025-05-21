/**
 * Schema definition for news data filters
 */
export default {
    provider: { 
      type: 'string', 
      required: false, 
      default: 'newsapi',
      description: 'Filter by news provider'
    },
    sourceName: { 
      type: 'string', 
      required: false,
      description: 'Filter by news source name'
    },
    author: { 
      type: 'string', 
      required: false,
      description: 'Filter by article author'
    },
    fromDate: { 
      type: 'date', 
      required: false,
      description: 'Filter articles published after this date'
    },
    toDate: { 
      type: 'date', 
      required: false,
      description: 'Filter articles published before this date'
    },
    query: { 
      type: 'string', 
      required: false,
      description: 'Search query for article content'
    }
  };
  