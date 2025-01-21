import React, { useLayoutEffect } from 'react';
import { Text, View, Button, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from "@react-navigation/core";
import useAuth from "../hooks/useAuth";
import { tailwind } from "tailwind-rn";

const HomeScreen = () => {
    const navigation = useNavigation();
    const { user, signOut } = useAuth();

    const handleSignOut = async () => {
        await signOut(); // Call signOut from the useAuth context
        navigation.navigate('Login'); // Navigate to Login screen after sign out
    };

    // Remove our header that says "Home"
    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false,
        });
    }, [navigation]);

    return (
        <SafeAreaView style={tailwind('flex-1')}>
            {/* Header */}
            <View style={tailwind('flex-row justify-between items-center px-4 py-2')}>
                <TouchableOpacity>
                    <Image
                        style={tailwind('h-12 w-12 rounded-full border-2 border-gray-300')}
                        source={{ uri: user.photoURL || 'https://via.placeholder.com/150' }}
                    />
                </TouchableOpacity>
                <Text style={tailwind('text-lg font-bold text-gray-800')}>
                    Welcome, {user?.displayName || "Guest"}
                </Text>
            </View>

            {/* End of header */}
            <View style={tailwind('flex-1 justify-center items-center')}>
                <Text style={tailwind('text-xl font-semibold')}>I am the HomeScreen</Text>
                <Button
                    title="Go to chat screen"
                    onPress={() => navigation.navigate("Chat")}
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