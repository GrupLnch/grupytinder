import React, { useState, useEffect } from 'react';
import { Text, View, SafeAreaView, TouchableOpacity, Image, TextInput, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useAuth from '../hooks/useAuth';
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from '@react-native-firebase/firestore';

const firestore = getFirestore();

const ProfileScreen = () => {
    const navigation = useNavigation();
    const { user, signOut } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState({
        displayName: '',
        foodInterests: '',
        favoriteCuisines: '',
        dietaryRestrictions: '',
        bio: ''
    });

    useEffect(() => {
        const loadUserProfile = async () => {
            if (!user?.uid) {
                setLoading(false);
                return;
            }

            try {
                console.log("Loading profile for user:", user.uid);
                const profileRef = doc(firestore, 'users', user.uid);
                const profileDoc = await getDoc(profileRef);

                if (profileDoc.exists()) {
                    const profileData = profileDoc.data();
                    console.log("Profile data loaded:", profileData);

                    setProfile({
                        displayName: profileData?.displayName || user.displayName || '',
                        foodInterests: profileData?.foodInterests || '',
                        favoriteCuisines: profileData?.favoriteCuisines || '',
                        dietaryRestrictions: profileData?.dietaryRestrictions || '',
                        bio: profileData?.bio || ''
                    });
                } else {
                    console.log("No profile document found, using defaults");
                    // Initialize with user's display name from auth
                    setProfile({
                        displayName: user.displayName || '',
                        foodInterests: '',
                        favoriteCuisines: '',
                        dietaryRestrictions: '',
                        bio: ''
                    });
                }
            } catch (error) {
                console.error("Error loading profile:", error);
                Alert.alert("Error", "Failed to load profile data. Please try again.");

                // Set defaults on error
                setProfile({
                    displayName: user.displayName || '',
                    foodInterests: '',
                    favoriteCuisines: '',
                    dietaryRestrictions: '',
                    bio: ''
                });
            } finally {
                setLoading(false);
            }
        };

        loadUserProfile();
    }, [user]);

    const saveProfile = async () => {
        if (!user?.uid) {
            Alert.alert("Error", "User not authenticated");
            return;
        }

        try {
            setSaving(true);

            const profileData = {
                displayName: profile.displayName || '',
                foodInterests: profile.foodInterests || '',
                favoriteCuisines: profile.favoriteCuisines || '',
                dietaryRestrictions: profile.dietaryRestrictions || '',
                bio: profile.bio || '',
                updatedAt: serverTimestamp(),
                email: user.email || '',
                photoURL: user.photoURL || ''
            };

            await setDoc(doc(firestore, 'users', user.uid), profileData, { merge: true });

            Alert.alert("Success", "Profile updated successfully!");
        } catch (error) {
            console.error("Error saving profile:", error);
            Alert.alert("Error", "Failed to save profile. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleSignOut = async () => {
        Alert.alert(
            "Sign Out",
            "Are you sure you want to sign out?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Sign Out",
                    onPress: async () => {
                        try {
                            await signOut();
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'Login' }],
                            });
                        } catch (error) {
                            console.error("Error signing out:", error);
                            Alert.alert("Error", "Failed to sign out");
                        }
                    },
                    style: "destructive"
                }
            ]
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color="#3b82f6" />
                    <Text style={styles.loadingText}>Loading profile...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#1e293b" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Profile</Text>
                    <TouchableOpacity
                        onPress={saveProfile}
                        disabled={saving}
                        style={styles.saveButton}
                    >
                        {saving ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <Text style={styles.saveButtonText}>Save</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Profile Header Section */}
                    <View style={styles.profileHeader}>
                        <View style={styles.avatarContainer}>
                            <Image
                                style={styles.avatar}
                                source={{ uri: user?.photoURL || 'https://via.placeholder.com/150' }}
                            />
                            <View style={styles.avatarBadge}>
                                <MaterialIcons name="verified" size={20} color="#3b82f6" />
                            </View>
                        </View>

                        <Text style={styles.profileEmail}>{user?.email || 'No email'}</Text>
                        <Text style={styles.memberSince}>
                            Member since {user?.metadata?.creationTime
                                ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                                : 'Recently'}
                        </Text>
                    </View>

                    {/* Form Section */}
                    <View style={styles.formSection}>
                        {/* Display Name */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Display Name</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="person-outline" size={20} color="#64748b" />
                                <TextInput
                                    style={styles.input}
                                    value={profile.displayName}
                                    onChangeText={(text) => setProfile(prev => ({ ...prev, displayName: text }))}
                                    placeholder="Your display name"
                                    placeholderTextColor="#94a3b8"
                                />
                            </View>
                        </View>

                        {/* Bio */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Bio</Text>
                            <View style={[styles.inputContainer, styles.textAreaContainer]}>
                                <Ionicons name="create-outline" size={20} color="#64748b" style={styles.textAreaIcon} />
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    value={profile.bio}
                                    onChangeText={(text) => setProfile(prev => ({ ...prev, bio: text }))}
                                    placeholder="Tell others about yourself..."
                                    placeholderTextColor="#94a3b8"
                                    multiline
                                    numberOfLines={3}
                                    textAlignVertical="top"
                                />
                            </View>
                        </View>

                        {/* Food Interests */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Food Interests</Text>
                            <View style={[styles.inputContainer, styles.textAreaContainer]}>
                                <Text style={styles.textAreaIcon}>🍕</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    value={profile.foodInterests}
                                    onChangeText={(text) => setProfile(prev => ({ ...prev, foodInterests: text }))}
                                    placeholder="e.g. Spicy food, Desserts, Local cuisine..."
                                    placeholderTextColor="#94a3b8"
                                    multiline
                                    numberOfLines={2}
                                    textAlignVertical="top"
                                />
                            </View>
                        </View>

                        {/* Favorite Cuisines */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Favorite Cuisines</Text>
                            <View style={[styles.inputContainer, styles.textAreaContainer]}>
                                <Text style={styles.textAreaIcon}>🍽️</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    value={profile.favoriteCuisines}
                                    onChangeText={(text) => setProfile(prev => ({ ...prev, favoriteCuisines: text }))}
                                    placeholder="e.g. Italian, Thai, Mexican, Indian..."
                                    placeholderTextColor="#94a3b8"
                                    multiline
                                    numberOfLines={2}
                                    textAlignVertical="top"
                                />
                            </View>
                        </View>

                        {/* Dietary Restrictions */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Dietary Restrictions</Text>
                            <View style={[styles.inputContainer, styles.textAreaContainer]}>
                                <Text style={styles.textAreaIcon}>🥗</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    value={profile.dietaryRestrictions}
                                    onChangeText={(text) => setProfile(prev => ({ ...prev, dietaryRestrictions: text }))}
                                    placeholder="e.g. Vegetarian, Gluten-free, Allergies..."
                                    placeholderTextColor="#94a3b8"
                                    multiline
                                    numberOfLines={2}
                                    textAlignVertical="top"
                                />
                            </View>
                        </View>
                    </View>

                    {/* Sign Out Button */}
                    <View style={styles.dangerZone}>
                        <TouchableOpacity
                            onPress={handleSignOut}
                            style={styles.signOutButton}
                        >
                            <MaterialIcons name="logout" size={22} color="#ef4444" />
                            <Text style={styles.signOutText}>Sign Out</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    flex: {
        flex: 1,
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#64748b',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    backButton: {
        width: 40,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    saveButton: {
        backgroundColor: '#3b82f6',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 12,
        minWidth: 70,
        alignItems: 'center',
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    profileHeader: {
        backgroundColor: 'white',
        alignItems: 'center',
        paddingVertical: 32,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: '#e0e7ff',
    },
    avatarBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    profileEmail: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 4,
    },
    memberSince: {
        fontSize: 14,
        color: '#64748b',
    },
    formSection: {
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    textAreaContainer: {
        alignItems: 'flex-start',
        paddingTop: 16,
    },
    textAreaIcon: {
        marginTop: 2,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#1e293b',
    },
    textArea: {
        minHeight: 60,
        textAlignVertical: 'top',
    },
    dangerZone: {
        paddingHorizontal: 20,
        paddingTop: 32,
    },
    signOutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fef2f2',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 10,
        borderWidth: 1,
        borderColor: '#fecaca',
    },
    signOutText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ef4444',
    },
});

export default ProfileScreen;