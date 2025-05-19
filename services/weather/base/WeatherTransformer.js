import BaseTransformer from '../../base/transformer.js';

/**
 * Base Transformer for weather data that includes location normalization
 * Focused on standardizing country and city names across different providers
 */
class BaseWeatherTransformer extends BaseTransformer {
    /**
     * Normalize location data to a standard format
     * @param {Object} location - Raw location data
     * @returns {Object} Normalized location data with standardized city and country
     */
    _normalizeLocation(location) {
        if (!location) return {};
        
        const normalized = {
            city: this._normalizeCityName(location.city || location.LocalizedName || location.name || ''),
            country: this._normalizeCountryCode(location.country || location.Country?.LocalizedName || location.sys?.country || '')
        };
        
        // Preserve original data under raw
        normalized.raw = location;
        
        return normalized;
    }
    
    /**
     * Normalize city name to standard format
     * @private
     */
    _normalizeCityName(city) {
        if (!city) return '';
        
        // Handle common abbreviations and special cases
        const specialCases = {
            'ho chi minh': 'Ho Chi Minh',
            'ho chi minh city': 'Ho Chi Minh ',
            'hcm': 'Ho Chi Minh',
            'hanoi': 'Hanoi',
            'saigon': 'Ho Chi Minh City',
        };
        
        const lowerCity = city.trim().toLowerCase();
        if (specialCases[lowerCity]) {
            return specialCases[lowerCity];
        }
        
        // Title case with special handling for common abbreviations
        return city
            .toLowerCase()
            .split(' ')
            .map(word => {
                // Handle common abbreviations (e.g., 'St.', 'Mt.', 'Ft.')
                const abbreviations = ['st', 'mt', 'ft', 'dr', 'ave', 'blvd'];
                const baseWord = word.replace(/[^a-z]/gi, '').toLowerCase();
                if (abbreviations.includes(baseWord)) {
                    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                }
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            })
            .join(' ');
    }
    
    /**
     * Normalize country code to ISO 3166-1 alpha-2
     * @private
     */
    _normalizeCountryCode(country) {
        if (!country) return '';
        
        // If it's already a 2-letter code, return uppercase
        if (/^[A-Z]{2}$/i.test(country)) {
            return country.toUpperCase();
        }
        
        // Common country name mappings
        const countryMappings = {
            // Full names
            'united states': 'US',
            'united states of america': 'US',
            'united kingdom': 'GB',
            'great britain': 'GB',
            'vietnam': 'VN',
            'viet nam': 'VN',
            'japan': 'JP',
            'south korea': 'KR',
            'russia': 'RU',
            'china': 'CN',
            'germany': 'DE',
            'france': 'FR',
            'spain': 'ES',
            'italy': 'IT',
            'canada': 'CA',
            'australia': 'AU',
            'brazil': 'BR',
            'india': 'IN',
            'indonesia': 'ID',
            'thailand': 'TH',
            'singapore': 'SG',
            'malaysia': 'MY',
            'philippines': 'PH',
            
            // Common variations
            'america': 'US',
            'usa': 'US',
            'u.s.': 'US',
            'u.s.a.': 'US',
            'uk': 'GB',
            'u.k.': 'GB',
            'england': 'GB',
            'viet nam': 'VN',
            'vietnam': 'VN'
        };
        
        const lowerCountry = country.trim().toLowerCase();
        return countryMappings[lowerCountry] || country;
    }
    

}

export default BaseWeatherTransformer;
