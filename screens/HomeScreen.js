import React, { useLayoutEffect } from 'react';
import { Text, View, Button, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from "@react-navigation/core";
import useAuth from "../hooks/useAuth";
//import { create } from 'tailwind-rn';
//import styles from '../tailwind.json';

//const { tailwind } = create(styles);

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
        <SafeAreaView>
            {/* Header */}
            <View>
                <TouchableOpacity>
                    <Image
                        //style={tailwind('h-10 w-10 rounded-full')}
                        source={{ uri: user.photoURL }}
                    />
                </TouchableOpacity>
            </View>

            {/* End of header */}
            <Text>I am the HomeScreen</Text>
            <Text>Welcome, {user?.displayName || "Guest"}</Text>
            <Button
                title="Go to chat screen"
                onPress={() => navigation.navigate("Chat")}
            />
            <Button
                title="Log Out"
                onPress={handleSignOut}
            />
        </SafeAreaView>
    );
};

export default HomeScreen;