import React from 'react';
import { ActivityIndicator, Button, Text, View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useAuth from "../hooks/useAuth";

const LoginScreen = () => {
    const navigation = useNavigation();
    const { signInWithGoogle, loading } = useAuth();

    return (
        <View style={styles.container}>
            <Text style={styles.welcomeText}>Welcome to Grup Lnch</Text>

            {loading ? (
                <ActivityIndicator size="large" color="#FF5733" />
            ) : (
                <Button
                    title="Login"
                    onPress={signInWithGoogle}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FFF8F0",
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        color: "#FF5733",
        textAlign: "center",
    },
});

export default LoginScreen;
