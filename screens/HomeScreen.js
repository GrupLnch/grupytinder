import React, { useState, useEffect, useRef } from 'react';
import { Text, View, Button, SafeAreaView, TouchableOpacity, Image, Alert, Linking, Modal, ScrollView, Switch} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import useAuth from '../hooks/useAuth';
import { Ionicons, MaterialIcons, AntDesign } from "@expo/vector-icons";
import Swiper from "react-native-deck-swiper";
import { fetchNearbyRestaurants } from '../utils/placesApi';
import { doc, setDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

const HomeScreen = () => {
    const navigation = useNavigation();
    const { user, signOut } = useAuth();
    const [restaurants, setRestaurants] = useState([]);
    const [allRestaurants, setAllRestaurants] = useState([]); // Store unfiltered results
    const [swipedCards, setSwipedCards] = useState([]);
    const [likedRestaurants, setLikedRestaurants] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        // Cuisine Types
        american: false,
        italian: false,
        mexican: false,
        chinese: false,
        indian: false,
        thai: false,
        japanese: false,
        mediterranean: false,
        french: false,
        korean: false,
        vietnamese: false,
        greek: false,

        // Price Range
        budget: false,      // $
        moderate: false,    // $
        expensive: false,   // $$

        // Dietary
        vegetarian: false,
        vegan: false,
        glutenFree: false,
        halal: false,
        kosher: false,

        // Service Types
        dineIn: false,
        takeout: false,
        delivery: false,

        // Features
        openNow: false,
        wifi: false,

        // Distance
        nearby: false,      // < 1 mile
        walking: false,     // < 0.5 mile
        driving: false,     // < 5 miles
    });
    const swiperRef = useRef(null);

    // Load restaurants based on location
    useEffect(() => {
        const loadRestaurants = async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Using default location');
                const mockLocation = '37.7749,-122.4194';
                const results = await fetchNearbyRestaurants(mockLocation);
                setAllRestaurants(results);
                setRestaurants(results);
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const coords = `${location.coords.latitude},${location.coords.longitude}`;
            console.log("📍 User Location:", coords);
            const results = await fetchNearbyRestaurants(coords);
            setAllRestaurants(results);
            setRestaurants(results);
        };

        void loadRestaurants();
    }, []);

    // Apply filters whenever filters change
    useEffect(() => {
        applyFilters();
    }, [filters, allRestaurants]);

    const applyFilters = () => {
        if (!allRestaurants.length) return;

        // If no filters are active, show all restaurants
        const activeFilters = Object.values(filters).some(value => value);
        if (!activeFilters) {
            setRestaurants(allRestaurants);
            return;
        }

        const filtered = allRestaurants.filter(restaurant => {
            // Cuisine type filtering (basic keyword matching)
            if (filters.american && !restaurant.name?.toLowerCase().includes('american') && !restaurant.types?.includes('restaurant')) return false;
            if (filters.italian && !restaurant.name?.toLowerCase().includes('italian') && !restaurant.types?.includes('italian')) return false;
            if (filters.mexican && !restaurant.name?.toLowerCase().includes('mexican') && !restaurant.types?.includes('mexican')) return false;
            if (filters.chinese && !restaurant.name?.toLowerCase().includes('chinese') && !restaurant.types?.includes('chinese')) return false;
            if (filters.indian && !restaurant.name?.toLowerCase().includes('indian') && !restaurant.types?.includes('indian')) return false;
            if (filters.thai && !restaurant.name?.toLowerCase().includes('thai') && !restaurant.types?.includes('thai')) return false;
            if (filters.japanese && !restaurant.name?.toLowerCase().includes('japanese') && !restaurant.name?.toLowerCase().includes('sushi') && !restaurant.types?.includes('japanese')) return false;

            // Meal time filtering (based on opening hours and restaurant types)
            if (filters.breakfast && !restaurant.types?.includes('breakfast_restaurant') && !restaurant.name?.toLowerCase().includes('breakfast')) return false;
            if (filters.brunch && !restaurant.name?.toLowerCase().includes('brunch') && !restaurant.name?.toLowerCase().includes('cafe')) return false;
            if (filters.lunch && !restaurant.types?.includes('restaurant')) return false;
            if (filters.dinner && !restaurant.types?.includes('restaurant')) return false;

            // Open now filter
            if (filters.openNow && restaurant.opening_hours && !restaurant.opening_hours.open_now) return false;

            // Price range (using rating as a proxy since Google Places doesn't always provide price level)
            if (filters.budget && restaurant.rating && restaurant.rating > 4.0) return false;
            if (filters.expensive && restaurant.rating && restaurant.rating < 4.0) return false;

            return true;
        });

        setRestaurants(filtered);
    };

    const resetFilters = () => {
        const resetFilters = Object.keys(filters).reduce((acc, key) => {
            acc[key] = false;
            return acc;
        }, {});
        setFilters(resetFilters);
    };

    const toggleFilter = (filterKey) => {
        setFilters(prev => ({
            ...prev,
            [filterKey]: !prev[filterKey]
        }));
    };

    // Load liked restaurants from Firebase
    useEffect(() => {
        const fetchLikedRestaurants = async () => {
            if (!user?.uid) return;

            try {
                const q = query(
                    collection(db, "users", user.uid, "likedRestaurants")
                );

                const querySnapshot = await getDocs(q);
                const likedPlaces = [];

                querySnapshot.forEach((doc) => {
                    likedPlaces.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });

                setLikedRestaurants(likedPlaces);
                console.log(`Loaded ${likedPlaces.length} liked restaurants`);
            } catch (error) {
                console.error("Error fetching liked restaurants:", error);
            }
        };

        fetchLikedRestaurants();
    }, [user]);

    // Save a restaurant to Firebase when liked
    const saveLikedRestaurant = async (restaurant) => {
        if (!user?.uid) {
            Alert.alert("Not logged in", "Please login to save favorites");
            return;
        }

        try {
            // Prepare restaurant data (keep only what we need)
            const restaurantData = {
                place_id: restaurant.place_id,
                name: restaurant.name,
                vicinity: restaurant.vicinity,
                rating: restaurant.rating,
                user_ratings_total: restaurant.user_ratings_total,
                photos: restaurant.photos,
                geometry: restaurant.geometry,
                opening_hours: restaurant.opening_hours,
                savedAt: new Date().toISOString(),
            };

            // Save to Firestore
            await setDoc(
                doc(db, "users", user.uid, "likedRestaurants", restaurant.place_id),
                restaurantData
            );

            // Update local state
            setLikedRestaurants(prev => [...prev, restaurantData]);

            console.log("Liked and saved:", restaurant.name);
        } catch (error) {
            console.error("Error saving liked restaurant:", error);
            Alert.alert("Error", "Failed to save restaurant to favorites");
        }
    };

    // Remove a restaurant from Firebase when disliked
    const removeRestaurantFromLikes = async (restaurant) => {
        if (!user?.uid || !restaurant?.place_id) return;

        try {
            // Check if this restaurant was previously liked
            const isLiked = likedRestaurants.some(r => r.place_id === restaurant.place_id);

            if (isLiked) {
                // Delete from Firestore
                await deleteDoc(doc(db, "users", user.uid, "likedRestaurants", restaurant.place_id));

                // Update local state
                setLikedRestaurants(prev => prev.filter(r => r.place_id !== restaurant.place_id));

                console.log("Removed from likes:", restaurant.name);
            }
        } catch (error) {
            console.error("Error removing restaurant from likes:", error);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        navigation.navigate('Login');
    };

    const renderCard = (card) => {
        if (!card) return <Text>No card data</Text>;

        const photoReference = card.photos?.[0]?.photo_reference;
        const imageUrl = photoReference
            ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${process.env.GOOGLE_PLACES_API_KEY}`
            : 'https://via.placeholder.com/150';

        const openNow = card.opening_hours?.open_now;
        const rating = card.rating;
        const ratingsTotal = card.user_ratings_total;

        // Mock service availability randomly for now (takeout, delivery, dineIn)
        const supportsDelivery = Math.random() > 0.5;
        const supportsTakeout = Math.random() > 0.3;
        const supportsDineIn = Math.random() > 0.7;

        // Check if this restaurant is already liked
        const isAlreadyLiked = likedRestaurants.some(r => r.place_id === card.place_id);

        return (
            <View className="justify-center items-center bg-white rounded-3xl shadow-2xl border border-white/20 overflow-hidden" style={{
                height: 420,
                width: 340,
                background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.25,
                shadowRadius: 20,
                elevation: 15
            }}>
                {/* Card Image with Overlay */}
                <View className="relative">
                    <Image
                        source={{ uri: imageUrl }}
                        className="h-64 w-80 rounded-2xl"
                        resizeMode="cover"
                    />
                    {/* Gradient Overlay for better text readability */}
                    <View className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-2xl" />

                    {/* Like indicator */}
                    {isAlreadyLiked && (
                        <View className="absolute top-3 right-3 bg-red-500 rounded-full p-2">
                            <AntDesign name="heart" size={16} color="white" />
                        </View>
                    )}
                </View>

                <View className="px-6 mt-4 w-full flex-1 justify-between">
                    <View>
                        <Text className="text-xl font-bold text-center text-gray-800 leading-tight">
                            {card.name || 'Unknown'}
                        </Text>

                        <View className="flex-row justify-center items-center mt-2">
                            <View className={`px-3 py-1 rounded-full ${openNow ? 'bg-green-100' : 'bg-red-100'}`}>
                                <Text className={`text-xs font-semibold ${openNow ? 'text-green-700' : 'text-red-700'}`}>
                                    {openNow !== undefined ? (openNow ? 'Open Now' : 'Closed') : 'Status Unknown'}
                                </Text>
                            </View>
                        </View>

                        {rating && (
                            <View className="flex-row justify-center items-center mt-2">
                                <View className="bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
                                    <Text className="text-yellow-700 text-sm font-medium">
                                        ⭐ {rating} ({ratingsTotal} reviews)
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>

                    <View className="flex-row justify-between items-center mt-4 mb-2">
                        {/* Service Options with better styling */}
                        <View className="flex-row space-x-3">
                            {supportsDelivery && (
                                <View className="bg-blue-100 rounded-full p-2">
                                    <Text className="text-sm">🚗</Text>
                                </View>
                            )}
                            {supportsTakeout && (
                                <View className="bg-orange-100 rounded-full p-2">
                                    <Text className="text-sm">🥡</Text>
                                </View>
                            )}
                            {supportsDineIn && (
                                <View className="bg-purple-100 rounded-full p-2">
                                    <Text className="text-sm">🍽️</Text>
                                </View>
                            )}
                        </View>

                        {/* Directions Icon with better styling */}
                        <TouchableOpacity
                            onPress={() => {
                                const { lat, lng } = card.geometry?.location || {};
                                if (lat && lng) {
                                    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
                                    Linking.openURL(url);
                                }
                            }}
                            className="bg-blue-500 rounded-full p-3 shadow-md"
                        >
                            <MaterialIcons name="directions" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView testID="home-screen-view" className="flex-1" style={{ backgroundColor: '#FFD1A1' }}>
            {/* Remove or replace the gradient background overlay */}
            {/* <View className="absolute inset-0" style={{
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #4facfe 100%)'
    }} /> */}

            {/* Header - Enhanced with glass effect */}
            <View className="flex-row justify-between items-center px-6 py-5 bg-white/10 backdrop-blur-lg border-b border-white/20">
                {/* Profile Icon - Enhanced with glow */}
                <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                    <View className="relative">
                        <Image
                            className="h-14 w-14 rounded-full border-3 border-white shadow-lg"
                            source={{ uri: user?.photoURL || 'https://via.placeholder.com/150' }}
                        />
                        <View className="absolute -inset-1 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 opacity-30 blur-sm" />
                    </View>
                </TouchableOpacity>

                {/* Centered Logo - Enhanced styling */}
                <View className="flex-1 items-center">
                    <Text className="text-4xl font-extrabold" style={{
                        fontFamily: 'System',
                        color: '#FFFFFF',
                        textShadowColor: 'rgba(0, 0, 0, 0.6)',
                        textShadowOffset: { width: 0, height: 4 },
                        textShadowRadius: 10,
                        letterSpacing: 2
                    }}>
                        Grup Lnch
                    </Text>
                    <View className="w-20 h-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mt-2 shadow-md" />
                    <View className="w-12 h-0.5 bg-white/50 rounded-full mt-1" />
                </View>

                {/* Filter Icon - Enhanced */}
                <TouchableOpacity onPress={() => setShowFilters(true)}>
                    <View className="bg-white/30 rounded-full p-3 border border-white/40 shadow-md shadow-black/30">
                        <Ionicons name="options" size={26} color="#FFF" style={{ textShadowColor: 'rgba(0,0,0,0.4)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 }} />
                    </View>
                </TouchableOpacity>
            </View>
            {/* End of Header */}

            {/* Cards - Enhanced with better spacing */}
            <View className="flex-1 justify-center items-center px-4 mt-4 mb-4">
                {restaurants.length > 0 ? (
                    <Swiper
                        ref={swiperRef}
                        cards={restaurants}
                        renderCard={renderCard}
                        onSwipedLeft={(index) => {
                            const restaurant = restaurants[index];
                            setSwipedCards(prev => [restaurant, ...prev]);
                            removeRestaurantFromLikes(restaurant);
                            console.log('Swiped left (disliked):', restaurant.name);
                        }}
                        onSwipedRight={(index) => {
                            const restaurant = restaurants[index];
                            setSwipedCards(prev => [restaurant, ...prev]);
                            saveLikedRestaurant(restaurant);
                            console.log('Swiped right (liked):', restaurant.name);
                        }}
                        onSwipedAll={() => {
                            if (swipedCards.length > 0) {
                                setRestaurants(swipedCards);
                                setSwipedCards([]);
                            }
                        }}
                        backgroundColor="transparent"
                        cardIndex={0}
                        stackSize={1}
                        stackSeparation={0}
                        animateCardOpacity={false}
                        verticalSwipe={false}
                        cardVerticalMargin={0}
                        cardHorizontalMargin={20}
                        marginTop={0}
                        marginBottom={0}
                        showSecondCard={false}
                        useViewOverflow={false}
                    />
                ) : (
                    <View className="flex-1 justify-center items-center">
                        <View className="bg-white/20 backdrop-blur-md rounded-2xl p-8 border border-white/30">
                            <Text className="text-white text-xl font-semibold text-center">
                                Loading restaurants...
                            </Text>
                            <Text className="text-white/80 text-sm text-center mt-2">
                                Finding amazing places near you
                            </Text>
                        </View>
                    </View>
                )}
            </View>

            {/* Like/Dislike Buttons - Enhanced with gradients */}
            <View className="flex-row justify-center items-center space-x-12 py-6 mb-8">
                <TouchableOpacity
                    onPress={() => {
                        if (swiperRef.current) {
                            swiperRef.current.swipeLeft();
                        }
                    }}
                    style={{
                        background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                        shadowColor: '#ff6b6b',
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.3,
                        shadowRadius: 15
                    }}
                    className="w-16 h-16 rounded-full justify-center items-center bg-red-500"
                >
                    <AntDesign name="close" size={28} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => {
                        if (swiperRef.current) {
                            swiperRef.current.swipeRight();
                        }
                    }}
                    style={{
                        background: 'linear-gradient(135deg, #51cf66 0%, #40c057 100%)',
                        shadowColor: '#51cf66',
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.3,
                        shadowRadius: 15
                    }}
                    className="w-16 h-16 rounded-full justify-center items-center bg-green-500"
                >
                    <AntDesign name="heart" size={28} color="white" />
                </TouchableOpacity>
            </View>

            {/* Filter Modal */}
            <Modal
                visible={showFilters}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <SafeAreaView className="flex-1 bg-white">
                    {/* Filter Header */}
                    <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
                        <TouchableOpacity onPress={() => setShowFilters(false)}>
                            <Text className="text-orange-500 text-lg font-semibold">Cancel</Text>
                        </TouchableOpacity>
                        <Text className="text-xl font-bold">Filters</Text>
                        <TouchableOpacity onPress={resetFilters}>
                            <Text className="text-orange-500 text-lg font-semibold">Reset</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView className="flex-1 p-4">
                        {/* Cuisine Types */}
                        <View className="mb-6">
                            <Text className="text-lg font-bold mb-3 text-gray-800">Cuisine</Text>
                            <View className="flex-row flex-wrap">
                                {[
                                    { key: 'american', label: 'American' },
                                    { key: 'italian', label: 'Italian' },
                                    { key: 'mexican', label: 'Mexican' },
                                    { key: 'chinese', label: 'Chinese' },
                                    { key: 'indian', label: 'Indian' },
                                    { key: 'thai', label: 'Thai' },
                                    { key: 'japanese', label: 'Japanese' },
                                    { key: 'mediterranean', label: 'Mediterranean' },
                                    { key: 'french', label: 'French' },
                                    { key: 'korean', label: 'Korean' },
                                    { key: 'vietnamese', label: 'Vietnamese' },
                                    { key: 'greek', label: 'Greek' },
                                ].map(filter => (
                                    <TouchableOpacity
                                        key={filter.key}
                                        onPress={() => toggleFilter(filter.key)}
                                        className={`mr-2 mb-2 px-4 py-2 rounded-full border ${
                                            filters[filter.key]
                                                ? 'bg-orange-500 border-orange-500'
                                                : 'bg-white border-gray-300'
                                        }`}
                                    >
                                        <Text className={`${
                                            filters[filter.key] ? 'text-white' : 'text-gray-700'
                                        }`}>
                                            {filter.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Price Range */}
                        <View className="mb-6">
                            <Text className="text-lg font-bold mb-3 text-gray-800">Price Range</Text>
                            <View className="flex-row flex-wrap">
                                {[
                                    { key: 'budget', label: '$ Budget' },
                                    { key: 'moderate', label: '$ Moderate' },
                                    { key: 'expensive', label: '$$ Expensive' },
                                ].map(filter => (
                                    <TouchableOpacity
                                        key={filter.key}
                                        onPress={() => toggleFilter(filter.key)}
                                        className={`mr-2 mb-2 px-4 py-2 rounded-full border ${
                                            filters[filter.key]
                                                ? 'bg-orange-500 border-orange-500'
                                                : 'bg-white border-gray-300'
                                        }`}
                                    >
                                        <Text className={`${
                                            filters[filter.key] ? 'text-white' : 'text-gray-700'
                                        }`}>
                                            {filter.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Dietary Restrictions */}
                        <View className="mb-6">
                            <Text className="text-lg font-bold mb-3 text-gray-800">Dietary</Text>
                            <View className="flex-row flex-wrap">
                                {[
                                    { key: 'vegetarian', label: 'Vegetarian' },
                                    { key: 'vegan', label: 'Vegan' },
                                    { key: 'glutenFree', label: 'Gluten-Free' },
                                    { key: 'halal', label: 'Halal' },
                                    { key: 'kosher', label: 'Kosher' },
                                ].map(filter => (
                                    <TouchableOpacity
                                        key={filter.key}
                                        onPress={() => toggleFilter(filter.key)}
                                        className={`mr-2 mb-2 px-4 py-2 rounded-full border ${
                                            filters[filter.key]
                                                ? 'bg-orange-500 border-orange-500'
                                                : 'bg-white border-gray-300'
                                        }`}
                                    >
                                        <Text className={`${
                                            filters[filter.key] ? 'text-white' : 'text-gray-700'
                                        }`}>
                                            {filter.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Features */}
                        <View className="mb-6">
                            <Text className="text-lg font-bold mb-3 text-gray-800">Features</Text>
                            <View className="space-y-3">
                                {[
                                    { key: 'openNow', label: 'Open Now' },
                                    { key: 'dineIn', label: 'Dine-In Available' },
                                    { key: 'takeout', label: 'Takeout Available' },
                                    { key: 'delivery', label: 'Delivery Available' },
                                    { key: 'wifi', label: 'Free WiFi' },
                                ].map(filter => (
                                    <View key={filter.key} className="flex-row justify-between items-center">
                                        <Text className="text-gray-700 text-base">{filter.label}</Text>
                                        <Switch
                                            value={filters[filter.key]}
                                            onValueChange={() => toggleFilter(filter.key)}
                                            trackColor={{ false: '#E5E7EB', true: '#FF5733' }}
                                            thumbColor={filters[filter.key] ? '#ffffff' : '#9CA3AF'}
                                        />
                                    </View>
                                ))}
                            </View>
                        </View>
                    </ScrollView>

                    {/* Apply Filters Button */}
                    <View className="p-4 border-t border-gray-200">
                        <TouchableOpacity
                            onPress={() => setShowFilters(false)}
                            className="bg-orange-500 py-4 rounded-xl"
                        >
                            <Text className="text-white text-center text-lg font-semibold">
                                Apply Filters ({restaurants.length} restaurants)
                            </Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </Modal>

        </SafeAreaView>
    );
};

export default HomeScreen;