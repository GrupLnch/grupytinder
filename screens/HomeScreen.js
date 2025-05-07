import React, { useState, useEffect, useRef } from 'react';
import { Text, View, Button, SafeAreaView, TouchableOpacity, Image, Alert, Linking} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import useAuth from '../hooks/useAuth';
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import Swiper from "react-native-deck-swiper";
import { fetchNearbyRestaurants } from '../utils/placesApi';

const HomeScreen = () => {
    const navigation = useNavigation();
    const { user, signOut } = useAuth();
    const [restaurants, setRestaurants] = useState([]);
    const [swipedCards, setSwipedCards] = useState([]);
    const swiperRef = useRef(null);

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

        return (
            <View className="h-[320px] w-full justify-center items-center bg-white p-4 rounded-2xl shadow-xl">
                <Image
                    source={{ uri: imageUrl }}
                    className="h-60 w-60 rounded-2xl"
                    resizeMode="cover"
                />

                <Text className="text-xl font-semibold mt-2 text-center">
                    {card.name || 'Unknown'}
                </Text>

                <Text className="text-center mt-1 text-gray-600 text-sm">
                    {openNow !== undefined ? (openNow ? 'Open Now' : 'Closed') : 'Status Unknown'}
                </Text>

                {rating && (
                    <Text className="text-center mt-1 text-gray-500 text-xs">
                        ⭐ {rating} ({ratingsTotal} reviews)
                    </Text>
                )}

                <View className="flex-row justify-between items-center mt-2 w-full px-4">
                    {/* Service Options */}
                    <View className="flex-row space-x-2">
                        {supportsDelivery && <Text className="text-xs">🚗</Text>}
                        {supportsTakeout && <Text className="text-xs">🥡</Text>}
                        {supportsDineIn && <Text className="text-xs">🍽️</Text>}
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
                        <MaterialIcons name="directions" size={24} color="#4285F4" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView testID="home-screen-view" className="flex-1 bg-white">
            {/* Header */}
            <View className="flex-row justify-between items-center px-4 py-4">
                {/* Profile Icon */}
                <TouchableOpacity>
                    <Image
                        className="h-12 w-12 rounded-full border-2 border-gray-300"
                        source={{ uri: user?.photoURL || 'https://via.placeholder.com/150' }}
                    />
                </TouchableOpacity>

                {/* Centered Logo */}
                <View className="flex-1 items-center">
                    <Image
                        source={require("../media/Logo 1 (So cool).png")}
                        className="h-14 w-14"
                    />
                </View>

                {/* Chat Icon */}
                <TouchableOpacity testID="chat-icon" onPress={() => navigation.navigate('Chat')}>
                    <Ionicons name="chatbubbles-sharp" size={30} color="#333" />
                </TouchableOpacity>
            </View>
            {/* End of Header */}

            {/* Cards */}
            <View className="flex justify-center items-center px-4 mt-4 mb-2 h-[75%]">
                {restaurants.length > 0 ? (
                    <Swiper
                        ref={swiperRef}
                        cards={restaurants}
                        renderCard={renderCard}
                        onSwipedLeft={(index) => {
                            setSwipedCards(prev => [restaurants[index], ...prev]);
                            console.log('Swiped left');
                        }}
                        onSwipedRight={(index) => {
                            setSwipedCards(prev => [restaurants[index], ...prev]);
                            console.log('Swiped right');
                        }}
                        onSwipedAll={() => {
                            if (swipedCards.length > 0) {
                                setRestaurants(swipedCards);
                                setSwipedCards([]);
                            }
                        }}
                        backgroundColor="#f0f0f0"
                        cardIndex={0}
                        stackSize={3}
                        animateCardOpacity
                        verticalSwipe={false}
                    />
                ) : (
                    <View className="flex-1 justify-center items-center">
                        <Text>Loading restaurants...</Text>
                    </View>
                )}
            </View>

            {/* Log Out Button */}
            <View className="px-4 py-2 absolute bottom-4 w-full">
                <Button
                    title="Log Out"
                    onPress={handleSignOut}
                />
            </View>
        </SafeAreaView>
    );
};

export default HomeScreen;
