
import { GOOGLE_PLACES_API_KEY } from '@env';

/**
 * Fetch nearby restaurants from Google Places API
 * @param {string} location - The latitude and longitude (e.g., "37.7749,-122.4194")
 * @param {number} radius - Search radius in meters (default: 1500)
 * @returns {Promise<Array>} - List of nearby restaurants
 */
export const fetchNearbyRestaurants = async (location, radius = 1500) => {
    console.log("GOOGLE_PLACES_API_KEY Loaded:", GOOGLE_PLACES_API_KEY ? "key-is-loaded" : "undefined"); // Check if key exists

    try {
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=${radius}&type=restaurant&key=${GOOGLE_PLACES_API_KEY}`;
        console.log(" Final URL to fetch:", url);
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Failed to fetch places');
        }

        const data = await response.json();

        if (data.status !== 'OK') {
            throw new Error(`Google Places API error: ${data.status}`);
        }

        return data.results;
    } catch (error) {
        console.error('Error fetching nearby restaurants:', error);
        return [];
    }
};
