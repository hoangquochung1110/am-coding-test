class BaseApiClient {
    constructor(baseURL, defaultOptions = {}) {
        this.baseURL = baseURL;
        this.defaultOptions = defaultOptions;
        
        // Store any default params from options
        this.defaultParams = defaultOptions.params || {};
    }

    // Helper to build URL with query parameters
    _buildUrl(endpoint, params = {}) {       
        // Remove leading slash from endpoint if present
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
        
        // Construct full URL ensuring proper path combination
        const url = new URL(this.baseURL);
        const basePath = url.pathname.replace(/\/$/, ''); // Remove trailing slash
        url.pathname = basePath + '/' + cleanEndpoint;
        
        
        // Add default params and merge with endpoint params
        const allParams = { 
            ...this.defaultParams, 
            ...(typeof params === 'object' && params.params ? params.params : params) 
        };
        
        // Append params to URL
        Object.entries(allParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                url.searchParams.append(key, String(value));
            }
        });
        
        return url.toString();
    }

    // Helper for making requests
    async _makeRequest(endpoint, options = {}) {
        try {
            // Ensure we have a headers object
            const headers = options.headers || {};
            
            // Add User-Agent header if not already present
            if (!headers['User-Agent']) {
                headers['User-Agent'] = 'am-coding-test/1.0 (CloudflareWorker)';
            }
            
            // Update options with our headers
            const updatedOptions = {
                ...options,
                headers
            };
            
            const response = await fetch(
                this._buildUrl(endpoint, options.params), 
                updatedOptions
            );
            
            // Check if response is ok
            if (!response.ok) {
                let errorMessage = `API Error: ${response.status}`;
                try {
                    // Try to get error message from response body
                    const errorData = await response.json();
                    errorMessage += ` - ${errorData.message || ''}`;
                } catch (e) {
                    // If parsing fails, use statusText
                    errorMessage += ` - ${response.statusText}`;
                }
                throw new Error(errorMessage);
            }
            
            // Parse JSON response
            return await response.json();
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('No response received from the server');
            }
            throw error;
        }
    }

    async get(endpoint, params = {}) {
        return this._makeRequest(endpoint, { 
            method: 'GET',
            params
        });
    }

    async post(endpoint, data = {}, config = {}) {
        return this._makeRequest(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
                ...(config.headers || {})
            },
            ...config,
        });
    }

    async put(endpoint, data = {}, config = {}) {
        return this._makeRequest(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
                ...(config.headers || {})
            },
            ...config,
        });
    }

    async delete(endpoint, config = {}) {
        return this._makeRequest(endpoint, {
            method: 'DELETE',
            ...config,
        });
    }
}

export { BaseApiClient };
