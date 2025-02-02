import React, { useState } from 'react';
import { Text, View, Button, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useAuth from '../hooks/useAuth';
import { Ionicons } from "@expo/vector-icons";
import Swiper from "react-native-deck-swiper";

const HomeScreen = () => {
    const navigation = useNavigation();
    const { user, signOut } = useAuth();

    // Static data for restaurants to test swiping
    const [restaurants, setRestaurants] = useState([
        {
            id: '1',
            name: 'Italian Bistro',
            imageUrl: 'https://via.placeholder.com/150',
            description: 'Authentic Italian food with great pasta and pizza options.',
        },
        {
            id: '2',
            name: 'Sushi House',
            imageUrl: 'https://via.placeholder.com/150',
            description: 'Delicious sushi and sashimi. A true Japanese experience.',
        },
        {
            id: '3',
            name: 'Vegan Vibes',
            imageUrl: 'https://via.placeholder.com/150',
            description: 'A plant-based restaurant serving healthy and tasty vegan dishes.',
        },
    ]);

    const handleSignOut = async () => {
        await signOut();
        navigation.navigate('Login');
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
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
                <TouchableOpacity onPress={() => navigation.navigate('Chat')}>
                    <Ionicons name="chatbubbles-sharp" size={30} color="#333" />
                </TouchableOpacity>
            </View>
            {/* End of Header */}

            {/* Cards */}
            <Swiper
                cards={restaurants}
                renderCard={(card) => (
                    <View className="flex-1 justify-center items-center bg-white p-4 rounded-lg shadow-lg">
                        <Image
                            source={{ uri: card.imageUrl }}
                            className="h-48 w-48 rounded-lg"
                        />
                        <Text className="text-xl font-semibold mt-2">{card.name}</Text>
                        <Text className="text-center mt-1">{card.description}</Text>
                    </View>
                )}
                onSwipedLeft={() => console.log('Swiped left')}
                onSwipedRight={() => console.log('Swiped right')}
                backgroundColor="#f0f0f0"
                cardIndex={0}
                stackSize={3}  // number of cards in stack before it starts rotating
                animateCardOpacity
                verticalSwipe={false}
            />

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
