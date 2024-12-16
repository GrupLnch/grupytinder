import React from 'react';
import { ActivityIndicator, Text, View, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useAuth from "../hooks/useAuth";

const LoginScreen = () => {
    const navigation = useNavigation();
    const { signInWithGoogle, loading } = useAuth();

    return (
        <ImageBackground
            source={require("../media/Logo 1 (So cool).png")}
            style={styles.backgroundImage}
            imageStyle={styles.imageStyle}
        >
            <View style={styles.overlay}>
                <Text style={styles.welcomeText}>Welcome to Grup Lnch</Text>

                {loading ? (
                    <ActivityIndicator size="large" color="#FF5733" />
                ) : (
                    <TouchableOpacity style={styles.loginButton} onPress={signInWithGoogle}>
                        <Text style={styles.loginButtonText}>Login</Text>
                    </TouchableOpacity>
                )}
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    imageStyle: {
        resizeMode: "cover",
        width: '100%',
        height: '100%',
    },
    overlay: {
        flex: 1,
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        paddingVertical: 50,
        width: "100%",
    },
    welcomeText: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#FFFFFF",
        textAlign: "center",
        textShadowColor: "rgba(0, 0, 0, 0.75)",
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 10,
        marginTop: 20,
        fontFamily: "monospace",
    },
    loginButton: {
        backgroundColor: "#FF5733",
        paddingVertical: 15,
        paddingHorizontal: 50,
        borderRadius: 25,
        marginBottom: 40,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    loginButtonText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
    },
});

export default LoginScreen;
