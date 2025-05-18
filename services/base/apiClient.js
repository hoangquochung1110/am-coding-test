import axios from 'axios';

class BaseApiClient {
    constructor(baseURL, defaultOptions = {}) {
        this.client = axios.create({
            baseURL,
            ...defaultOptions,
        });

        // Add request interceptor
        this.client.interceptors.request.use(
            (config) => {
                // You can modify the request config here (add headers, auth tokens, etc.)
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Add response interceptor
        this.client.interceptors.response.use(
            (response) => response.data,
            (error) => {
                if (error.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    throw new Error(`API Error: ${error.response.status} - ${error.response.data?.message || error.message}`);
                } else if (error.request) {
                    // The request was made but no response was received
                    throw new Error('No response received from the server');
                } else {
                    // Something happened in setting up the request
                    throw new Error(`Request failed: ${error.message}`);
                }
            }
        );
    }

    async get(endpoint, params = {}) {
        return this.client.get(endpoint, { params });
    }

    async post(endpoint, data = {}, config = {}) {
        return this.client.post(endpoint, data, config);
    }

    async put(endpoint, data = {}, config = {}) {
        return this.client.put(endpoint, data, config);
    }

    async delete(endpoint, config = {}) {
        return this.client.delete(endpoint, config);
    }
}

export default BaseApiClient;
