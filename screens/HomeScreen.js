import React, {useLayoutEffect} from 'react';
import {Text, View, Button, SafeAreaView} from 'react-native';
import { useNavigation } from "@react-navigation/core";
import useAuth from "../hooks/useAuth";

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
        })
    }, []);

    return (
        <SafeAreaView>
            <Text>I am the HomeScreen</Text>
            <Text>Welcome, {user?.displayName || "Guest"}</Text>
            <Button
                title="Go to chat screen"
                onPress={() => navigation.navigate("Chat")}
            />
            <Button
                title="Log Out"
                onPress={handleSignOut} // Sign out and navigate to Login screen
            />
        </SafeAreaView>
    );
};

export default HomeScreen;
