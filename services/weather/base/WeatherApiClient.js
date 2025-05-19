import { BaseApiClient } from '../../base/index.js';


class WeatherApiClient extends BaseApiClient {
    constructor(baseURL, defaultOptions = {}) {
        super(baseURL, defaultOptions);
    }
}

export { WeatherApiClient };
