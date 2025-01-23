import React, { useLayoutEffect } from 'react';
import { Text, View, Button, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useAuth from '../hooks/useAuth';

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
                        source={{ uri: user?.photoURL || 'https://via.placeholder.com/150' }}
                    />
                </TouchableOpacity>
                <Text>
                    Welcome, {user?.displayName || 'Guest'}
                </Text>
            </View>

            {/* Content */}
            <View>
                <Text>I am the HomeScreen</Text>
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
