import React, { useState } from 'react';
import { ActivityIndicator, Button, Text, View, StyleSheet } from 'react-native';
import useAuth from "../hooks/useAuth";

const LoginScreen = () => {
    const { signInWithGoogle } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setLoading(true);
        try {
            await signInWithGoogle();
        } finally {
            setLoading(false); // Reset loading state whether success or failure
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Login to Grup Lnch</Text>
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0000ff" />
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            ) : (
                <Button title="Login" onPress={handleLogin} />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 18,
        marginBottom: 20,
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#555',
    },
});

export default LoginScreen;
