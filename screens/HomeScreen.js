import React from 'react';
import { Text, View, Button, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useAuth from '../hooks/useAuth';

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
            <View className="flex-row justify-between items-center px-4 py-2">
                <TouchableOpacity>
                    <Image
                        className="h-12 w-12 rounded-full border-2 border-gray-300"
                        source={{ uri: user?.photoURL || 'https://via.placeholder.com/150' }}
                    />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-gray-800">
                    Welcome, {user?.displayName || 'Guest'}
                </Text>
            </View>

            {/* Content */}
            <View className="flex-1 justify-center items-center">
                <Text className="text-xl font-semibold">I am the HomeScreen</Text>
                <Button
                    title="Go to chat screen"
                    onPress={() => navigation.navigate('Chat')}
                />
                <Button
                    title="Log Out"
                    onPress={handleSignOut}
                />
            </View>
        </SafeAreaView>
    );
};

export default HomeScreen;
