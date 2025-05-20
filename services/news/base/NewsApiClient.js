import { BaseApiClient } from '../../base/index.js';


class NewsApiClient extends BaseApiClient {
    constructor(baseURL, defaultOptions = {}) {
        super(baseURL, defaultOptions);
    }
}
export default NewsApiClient;