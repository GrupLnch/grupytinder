import React, { useState, useEffect, useRef } from 'react';
import { Text, View, Button, SafeAreaView, TouchableOpacity, Image, Alert, Linking} from 'react-native';
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
    const [swipedCards, setSwipedCards] = useState([]);
    const [likedRestaurants, setLikedRestaurants] = useState([]);
    const swiperRef = useRef(null);

    // Load restaurants based on location
    useEffect(() => {
        const loadRestaurants = async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Using default location');
                const mockLocation = '37.7749,-122.4194';
                const results = await fetchNearbyRestaurants(mockLocation);
                setRestaurants(results);
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const coords = `${location.coords.latitude},${location.coords.longitude}`;
            console.log("📍 User Location:", coords);
            const results = await fetchNearbyRestaurants(coords);
            setRestaurants(results);
        };

        void loadRestaurants();
    }, []);

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
            <View className="h-[420px] w-[340px] justify-center items-center bg-white rounded-3xl shadow-2xl border border-gray-100">
                <Image
                    source={{ uri: imageUrl }}
                    className="h-72 w-80 rounded-2xl"
                    resizeMode="cover"
                />

                <View className="px-4 mt-4 w-full">
                    <Text className="text-xl font-bold text-center text-gray-800">
                        {card.name || 'Unknown'}
                        {isAlreadyLiked && " ❤️"}
                    </Text>

                    <Text className="text-center mt-1 text-gray-600 text-sm">
                        {openNow !== undefined ? (openNow ? 'Open Now' : 'Closed') : 'Status Unknown'}
                    </Text>

                    {rating && (
                        <Text className="text-center mt-1 text-gray-500 text-sm">
                            ⭐ {rating} ({ratingsTotal} reviews)
                        </Text>
                    )}

                    <View className="flex-row justify-between items-center mt-3 px-2">
                        {/* Service Options */}
                        <View className="flex-row space-x-3">
                            {supportsDelivery && <Text className="text-sm">🚗</Text>}
                            {supportsTakeout && <Text className="text-sm">🥡</Text>}
                            {supportsDineIn && <Text className="text-sm">🍽️</Text>}
                        </View>

                        {/* Directions Icon */}
                        <TouchableOpacity
                            onPress={() => {
                                const { lat, lng } = card.geometry?.location || {};
                                if (lat && lng) {
                                    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
                                    Linking.openURL(url);
                                }
                            }}
                        >
                            <MaterialIcons name="directions" size={26} color="#4285F4" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView testID="home-screen-view" className="flex-1 bg-white">
            {/* Header - Simplified, only profile and logo */}
            <View className="flex-row justify-between items-center px-4 py-4">
                {/* Profile Icon - Now clickable */}
                <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                    <Image
                        className="h-12 w-12 rounded-full border-2 border-gray-300"
                        source={{ uri: user?.photoURL || 'https://via.placeholder.com/150' }}
                    />
                </TouchableOpacity>

                {/* Centered Logo - Text instead of image */}
                <View className="flex-1 items-center">
                    <Text className="text-2xl font-bold text-orange-500" style={{ fontFamily: 'System' }}>
                        Grup Lnch
                    </Text>
                </View>

                {/* Empty space to balance the header layout */}
                <View className="w-12" />
            </View>
            {/* End of Header */}

            {/* Cards */}
            <View className="flex justify-center items-center px-4 mt-2 mb-4 h-[65%]">
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
                        cardHorizontalMargin={0}
                        marginTop={0}
                        marginBottom={0}
                        showSecondCard={false}
                        useViewOverflow={false}
                    />
                ) : (
                    <View className="flex-1 justify-center items-center">
                        <Text>Loading restaurants...</Text>
                    </View>
                )}
            </View>

            {/* Like/Dislike Buttons */}
            <View className="flex-row justify-center items-center space-x-10 py-2 mb-8">
                <TouchableOpacity
                    className="bg-red-100 w-16 h-16 rounded-full justify-center items-center shadow-md"
                    onPress={() => {
                        if (swiperRef.current) {
                            swiperRef.current.swipeLeft();
                        }
                    }}
                >
                    <AntDesign name="close" size={30} color="#FF3B30" />
                </TouchableOpacity>

                <TouchableOpacity
                    className="bg-green-100 w-16 h-16 rounded-full justify-center items-center shadow-md"
                    onPress={() => {
                        if (swiperRef.current) {
                            swiperRef.current.swipeRight();
                        }
                    }}
                >
                    <AntDesign name="heart" size={30} color="#34C759" />
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
};

export default HomeScreen;