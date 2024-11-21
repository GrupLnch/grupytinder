import { useNavigation } from "@react-navigation/core";
import React from 'react'
import { Text, View, Button } from 'react-native'
import useAuth from "../hooks/useAuth";

const HomeScreen = () => {
    const navigation = useNavigation();
    const { user, signOut } = useAuth();

    return (
        <View>
            <Text>I am the Homescreen</Text>
            <Text>Welcome, {user?.displayName || "Guest"}</Text>
            <Button
                title="Go to chat screen"
                onPress={() => navigation.navigate("Chat")}
            />
            <Button
                title="Log Out"
                onPress={() => signOut()} // Call the signOut function
            />
        </View>
    );
};

export default HomeScreen;