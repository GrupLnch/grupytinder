import { GOOGLE_PLACES_API_KEY } from '@env';

/**
 * Fetch nearby restaurants from Google Places API
 * @param {string} location - The latitude and longitude (e.g., "37.7749,-122.4194")
 * @param {number} radius - Search radius in meters (default: 1500)
 * @returns {Promise<Array>} - List of nearby restaurants with enhanced photo data
 */
export const fetchNearbyRestaurants = async (location, radius = 1500) => {
    console.log("GOOGLE_PLACES_API_KEY Loaded:", GOOGLE_PLACES_API_KEY ? "✓ Exists" : "✗ Missing");

    try {
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=${radius}&type=restaurant&key=${GOOGLE_PLACES_API_KEY}`;
        console.log("Fetching nearby restaurants...");
        
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Failed to fetch places');
        }

        const data = await response.json();

        if (data.status !== 'OK') {
            console.error(`Google Places API error: ${data.status}`);
            return [];
        }

        console.log(`✓ Found ${data.results.length} restaurants`);

        // Enhance each restaurant with proper photo URLs
        const enhancedResults = data.results.map(restaurant => {
            const photoReference = restaurant.photos?.[0]?.photo_reference;
            
            return {
                ...restaurant,
                photoUrl: photoReference 
                    ? getPhotoUrl(photoReference, 400)
                    : null,
                // Keep original photos array for reference
                originalPhotos: restaurant.photos
            };
        });

        return enhancedResults;
    } catch (error) {
        console.error('Error fetching nearby restaurants:', error);
        return [];
    }
};

/**
 * Generate a photo URL from a photo reference
 * @param {string} photoReference - The photo reference from Places API
 * @param {number} maxWidth - Maximum width of the photo (default: 400)
 * @returns {string} - Full photo URL
 */
export const getPhotoUrl = (photoReference, maxWidth = 400) => {
    if (!photoReference || !GOOGLE_PLACES_API_KEY) {
        return null;
    }
    
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${GOOGLE_PLACES_API_KEY}`;
};

/**
 * Fetch detailed place information including photos
 * @param {string} placeId - The place_id from Places API
 * @returns {Promise<Object>} - Detailed place information
 */
export const fetchPlaceDetails = async (placeId) => {
    if (!placeId || !GOOGLE_PLACES_API_KEY) {
        console.error("Missing placeId or API key");
        return null;
    }

    try {
        const fields = 'photos,name,rating,formatted_address,opening_hours,price_level,website,formatted_phone_number';
        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${GOOGLE_PLACES_API_KEY}`;
        
        console.log(`Fetching details for place: ${placeId}`);
        
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Failed to fetch place details');
        }

        const data = await response.json();

        if (data.status !== 'OK') {
            console.error(`Place Details API error: ${data.status}`);
            return null;
        }

        // Enhance photos with URLs
        const photos = data.result?.photos?.map(photo => ({
            ...photo,
            url: getPhotoUrl(photo.photo_reference, 800), // Higher res for details
            thumbnailUrl: getPhotoUrl(photo.photo_reference, 400)
        })) || [];

        return {
            ...data.result,
            enhancedPhotos: photos
        };
    } catch (error) {
        console.error('Error fetching place details:', error);
        return null;
    }
};

/**
 * Batch fetch photos for multiple restaurants
 * Useful if you want to lazy-load high-quality images
 * @param {Array} restaurants - Array of restaurant objects with place_id
 * @returns {Promise<Object>} - Object mapping place_id to photo URLs
 */
export const batchFetchRestaurantPhotos = async (restaurants) => {
    if (!Array.isArray(restaurants) || restaurants.length === 0) {
        return {};
    }

    console.log(`Batch fetching photos for ${restaurants.length} restaurants...`);

    const photoMap = {};

    // Process in parallel but with some rate limiting
    const batchSize = 5;
    for (let i = 0; i < restaurants.length; i += batchSize) {
        const batch = restaurants.slice(i, i + batchSize);
        
        const promises = batch.map(async (restaurant) => {
            if (!restaurant.place_id) return null;

            const details = await fetchPlaceDetails(restaurant.place_id);
            if (details?.enhancedPhotos?.length > 0) {
                photoMap[restaurant.place_id] = details.enhancedPhotos;
            }
            return null;
        });

        await Promise.all(promises);

        // Small delay between batches to avoid rate limiting
        if (i + batchSize < restaurants.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    console.log(`✓ Fetched photos for ${Object.keys(photoMap).length} restaurants`);
    return photoMap;
};

/**
 * Get a fallback placeholder image URL
 * @param {string} restaurantName - Name of the restaurant
 * @returns {string} - Placeholder image URL
 */
export const getPlaceholderImage = (restaurantName = 'Restaurant') => {
    const encodedName = encodeURIComponent(restaurantName.substring(0, 20));
    return `https://via.placeholder.com/400x240/94a3b8/ffffff?text=${encodedName}`;
};