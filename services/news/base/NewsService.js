import { BaseApiClient, BaseTransformer } from '../../base/index.js';

class NewsService {
    constructor(apiClient, transformer) {
        if (!(apiClient instanceof BaseApiClient)) {
            throw new Error('apiClient must be an instance of BaseApiClient');
        }
        if (!(transformer instanceof BaseTransformer)) {
            throw new Error('transformer must be an instance of BaseTransformer');
        }
        this.apiClient = apiClient;
        this.transformer = transformer;
    }

    /**
     * Get top headlines
     * @param {Object} options - Filter options (country, category, etc.)
     * @returns {Promise<Object>} Headlines data
     */
    async getTopHeadlines(options = {}) {
        throw new Error('getTopHeadlines() must be implemented');
    }

    /**
     * Standardize news data format
     * @param {Object} data - Raw news data
     * @returns {Object} Standardized news data
     * @protected
     */
    _standardizeNewsData(data) {
        return this.transformer.normalize(data);
    }
}

export default NewsService;
