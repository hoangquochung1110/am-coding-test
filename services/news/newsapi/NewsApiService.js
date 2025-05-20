import { NewsService } from '../base/index.js';
import NewsApiTransformer from './NewsApiTransformer.js';
import NewsApiApiClient from './NewsApiApiClient.js';

class NewsApiService extends NewsService {
    constructor(apiKey) {
        const apiClient = new NewsApiApiClient(apiKey);
        const transformer = new NewsApiTransformer();
        super(apiClient, transformer);
    }

    async getTopHeadlines(options = {}) {
        const data = await this.apiClient.getTopHeadlines(options);
        return this._standardizeNewsData(data);
    }
}

export default NewsApiService;