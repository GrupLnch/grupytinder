import React from 'react';
import { Text, View, Button, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useAuth from '../hooks/useAuth';
import {AntDesign, Entypo, Ionicons} from "@expo/vector-icons";

const HomeScreen = () => {
    const navigation = useNavigation();
    const { user, signOut } = useAuth();

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
                <View className="absolute left-1/2 transform -translate-x-1/2">
                    <Image
                        source={require("../media/Logo 1 (So cool).png")}
                        className="h-14 w-14"
                    />
                </View>

                {/* Chat Icon */}
                <TouchableOpacity className="absolute right-5 top-4" onPress={() => navigation.navigate('Chat')}>
                    <Ionicons name="chatbubbles-sharp" size={30} color="#333" />
                </TouchableOpacity>
            </View>

            {/* Content */}
            <View className="flex-1 justify-center items-center">
                <Text className="text-xl font-semibold">Welcome to HomeScreen</Text>
                <Button
                    title="Log Out"
                    onPress={handleSignOut}
                />
            </View>
        </SafeAreaView>
    );
};

export default HomeScreen;
