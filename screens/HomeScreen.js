import React, { useState, useEffect, useRef } from 'react';
import { Text, View, Button, SafeAreaView, TouchableOpacity, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import useAuth from '../hooks/useAuth';
import { Ionicons } from "@expo/vector-icons";
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

        return (
            <View className="h-[320px] w-full justify-center items-center bg-white p-4 rounded-lg shadow-lg">
                <Image
                    source={{ uri: imageUrl }}
                    className="h-40 w-40 rounded-lg"
                />
                <Text className="text-xl font-semibold mt-2">{card.name || 'Unknown'}</Text>
                <Text className="text-center mt-1">{card.description || 'No description'}</Text>
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
