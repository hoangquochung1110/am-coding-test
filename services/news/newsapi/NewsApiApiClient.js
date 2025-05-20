import { NewsApiClient } from '../base/index.js';

class NewsApiApiClient extends NewsApiClient {
    constructor(apiKey) {
        super('https://newsapi.org/v2', {
            params: {
                apiKey: apiKey
            }
        });
    }

    async getTopHeadlines(options = {}) {
        return this.get('/top-headlines', {
            country: options.country,
            category: options.category,
            q: options.query,
            pageSize: options.pageSize || 20,
            page: options.page || 1
        });
    }
}

export default NewsApiApiClient;