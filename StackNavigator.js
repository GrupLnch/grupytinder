import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";
import HomeScreen from "./screens/HomeScreen";
import ChatScreen from "./screens/ChatScreen";
import LoginScreen from "./screens/LoginScreen";
import FavoritesScreen from "./screens/FavoritesScreen";
import useAuth from "./hooks/useAuth";

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
    const { user, loading } = useAuth();

    if (loading) {
        // Show loading spinner while checking for active session
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#FF5733" />
            </View>
        );
    }

    return (
        <Stack.Navigator
            id="MainStackNavigator"
            // Hide the header globally for simplicity, you can add options to individual screens
            screenOptions={{
                headerShown: false
            }}
        >
            {user ? (
                <>
                    <Stack.Screen
                        name="Home"
                        component={HomeScreen}
                        // You can override global options like this if needed
                        // options={{ headerShown: true }}
                    />
                    <Stack.Screen
                        name="Chat"
                        component={ChatScreen}
                    />
                    {/* Add the FavoritesScreen here */}
                    <Stack.Screen
                        name="Favorites"
                        component={FavoritesScreen}
                    />
                </>
            ) : (
                <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                    options={{ headerShown: false }}
                />
            )}
        </Stack.Navigator>
    );
};

export default StackNavigator;