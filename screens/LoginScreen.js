import React from 'react';
import { ActivityIndicator, Text, View, StyleSheet, ImageBackground, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons, AntDesign } from '@expo/vector-icons';
import useAuth from "../hooks/useAuth";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const LoginScreen = () => {
    useNavigation();
    const { signInWithGoogle, loading } = useAuth();

    return (
        <ImageBackground
            source={require("../media/Logo 1 (So cool).png")}
            style={styles.backgroundImage}
            imageStyle={styles.imageStyle}
        >
            {/* Dark overlay for better contrast */}
            <View style={styles.overlay}>
                {/* Top Section - Logo & Branding */}
                <View style={styles.topSection}>
                    <View style={styles.logoContainer}>
                        <View style={styles.logoCircle}>
                            <Text style={styles.logoEmoji}>🍽️</Text>
                        </View>
                    </View>

                    <Text style={styles.appTitle}>Grup Lnch</Text>
                    <Text style={styles.tagline}>Food choices made easy!</Text>
                </View>

                {/* Features Section */}
                <View style={styles.featuresSection}>
                    <View style={styles.featureItem}>
                        <View style={styles.featureIcon}>
                            <AntDesign name="heart" size={20} color="#ef4444" />
                        </View>
                        <Text style={styles.featureText}>Swipe & Save Favorites</Text>
                    </View>

                    <View style={styles.featureItem}>
                        <View style={styles.featureIcon}>
                            <MaterialIcons name="explore" size={20} color="#3b82f6" />
                        </View>
                        <Text style={styles.featureText}>Explore Nearby Restaurants</Text>
                    </View>

                    <View style={styles.featureItem}>
                        <View style={styles.featureIcon}>
                            <MaterialIcons name="star" size={20} color="#f59e0b" />
                        </View>
                        <Text style={styles.featureText}>Find Highly Rated Places</Text>
                    </View>
                </View>

                {/* Bottom Section - Login Button */}
                <View style={styles.bottomSection}>
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#ffffff" />
                            <Text style={styles.loadingText}>Signing you in...</Text>
                        </View>
                    ) : (
                        <>
                            <TouchableOpacity
                                style={styles.googleButton}
                                onPress={() => {
                                    console.log("Login button pressed");
                                    signInWithGoogle();
                                }}
                                activeOpacity={0.8}
                            >
                                <View style={styles.googleIconContainer}>
                                    <Text style={styles.googleIcon}>G</Text>
                                </View>
                                <Text style={styles.googleButtonText}>Continue with Google</Text>
                            </TouchableOpacity>

                            <Text style={styles.termsText}>
                                By continuing, you agree to our{'\n'}
                                <Text style={styles.termsLink}>Terms of Service</Text>
                                {' & '}
                                <Text style={styles.termsLink}>Privacy Policy</Text>
                            </Text>
                        </>
                    )}
                </View>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
    },
    imageStyle: {
        resizeMode: 'cover',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'space-between',
        paddingVertical: 60,
        paddingHorizontal: 24,
    },

    // Top Section
    topSection: {
        alignItems: 'center',
        marginTop: 40,
    },
    logoContainer: {
        marginBottom: 24,
    },
    logoCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 10,
    },
    logoEmoji: {
        fontSize: 48,
    },
    appTitle: {
        fontSize: 42,
        fontWeight: 'bold',
        color: '#ffffff',
        textAlign: 'center',
        marginBottom: 8,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 10,
        letterSpacing: 1,
    },
    tagline: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },

    // Features Section
    featuresSection: {
        gap: 16,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    featureIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    featureText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
        flex: 1,
    },

    // Bottom Section
    bottomSection: {
        alignItems: 'center',
        gap: 16,
    },
    loadingContainer: {
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        fontSize: 16,
        color: '#ffffff',
        fontWeight: '500',
    },
    googleButton: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        gap: 12,
    },
    googleIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#4285F4',
        justifyContent: 'center',
        alignItems: 'center',
    },
    googleIcon: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    googleButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
    },
    termsText: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
        lineHeight: 18,
    },
    termsLink: {
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
});

export default LoginScreen;