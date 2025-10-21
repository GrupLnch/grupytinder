import React, { useState, useEffect } from 'react';
import {Text, View, SafeAreaView, TouchableOpacity, Image, TextInput, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform} from 'react-native';
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
                const profileDoc = await getDoc(doc(firestore, 'users', user.uid));

                if (profileDoc.exists) {
                    const profileData = profileDoc.data();
                    setProfile({
                        displayName: profileData.displayName || user.displayName || '',
                        foodInterests: profileData.foodInterests || '',
                        favoriteCuisines: profileData.favoriteCuisines || '',
                        dietaryRestrictions: profileData.dietaryRestrictions || '',
                        bio: profileData.bio || ''
                    });
                } else {
                    // Initialize with user's display name from auth
                    setProfile(prev => ({
                        ...prev,
                        displayName: user.displayName || ''
                    }));
                }
            } catch (error) {
                console.error("Error loading profile:", error);
                Alert.alert("Error", "Failed to load profile data");
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
                ...profile,
                updatedAt: serverTimestamp(),
                email: user.email,
                photoURL: user.photoURL
            };

            await setDoc(doc(firestore, 'users', user.uid), profileData, { merge: true });

            Alert.alert("Success", "Profile updated successfully!");
        } catch (error) {
            console.error("Error saving profile:", error);
            Alert.alert("Error", "Failed to save profile");
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
            <SafeAreaView className="flex-1 bg-white justify-center items-center">
                <ActivityIndicator size="large" color="#FF5733" />
                <Text className="mt-2 text-gray-600">Loading profile...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                {/* Header */}
                <View className="flex-row items-center justify-between p-4 bg-white shadow-sm">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold">Profile</Text>
                    <TouchableOpacity
                        onPress={saveProfile}
                        disabled={saving}
                        className="bg-orange-500 px-4 py-2 rounded-lg"
                    >
                        {saving ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <Text className="text-white font-semibold">Save</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    {/* Profile Picture Section */}
                    <View className="items-center py-6 bg-white mb-4">
                        <Image
                            className="h-24 w-24 rounded-full border-4 border-orange-200"
                            source={{ uri: user?.photoURL || 'https://via.placeholder.com/150' }}
                        />
                        <Text className="text-lg font-semibold mt-2 text-gray-800">
                            {user?.email}
                        </Text>
                        <Text className="text-sm text-gray-500">
                            Member since {new Date(user?.metadata?.creationTime).toLocaleDateString()}
                        </Text>
                    </View>

                    {/* Profile Form */}
                    <View className="px-4 space-y-4">
                        {/* Display Name */}
                        <View className="bg-white p-4 rounded-xl shadow-sm">
                            <Text className="text-sm font-semibold text-gray-700 mb-2">Display Name</Text>
                            <TextInput
                                className="text-base text-gray-800 border-b border-gray-200 pb-2"
                                value={profile.displayName}
                                onChangeText={(text) => setProfile(prev => ({ ...prev, displayName: text }))}
                                placeholder="Your display name"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>

                        {/* Bio */}
                        <View className="bg-white p-4 rounded-xl shadow-sm">
                            <Text className="text-sm font-semibold text-gray-700 mb-2">Bio</Text>
                            <TextInput
                                className="text-base text-gray-800 border-b border-gray-200 pb-2"
                                value={profile.bio}
                                onChangeText={(text) => setProfile(prev => ({ ...prev, bio: text }))}
                                placeholder="Tell others about yourself..."
                                placeholderTextColor="#9CA3AF"
                                multiline
                                numberOfLines={3}
                            />
                        </View>

                        {/* Food Interests */}
                        <View className="bg-white p-4 rounded-xl shadow-sm">
                            <Text className="text-sm font-semibold text-gray-700 mb-2">Food Interests</Text>
                            <TextInput
                                className="text-base text-gray-800 border-b border-gray-200 pb-2"
                                value={profile.foodInterests}
                                onChangeText={(text) => setProfile(prev => ({ ...prev, foodInterests: text }))}
                                placeholder="e.g. Spicy food, Desserts, Local cuisine..."
                                placeholderTextColor="#9CA3AF"
                                multiline
                                numberOfLines={2}
                            />
                        </View>

                        {/* Favorite Cuisines */}
                        <View className="bg-white p-4 rounded-xl shadow-sm">
                            <Text className="text-sm font-semibold text-gray-700 mb-2">Favorite Cuisines</Text>
                            <TextInput
                                className="text-base text-gray-800 border-b border-gray-200 pb-2"
                                value={profile.favoriteCuisines}
                                onChangeText={(text) => setProfile(prev => ({ ...prev, favoriteCuisines: text }))}
                                placeholder="e.g. Italian, Thai, Mexican, Indian..."
                                placeholderTextColor="#9CA3AF"
                                multiline
                                numberOfLines={2}
                            />
                        </View>

                        {/* Dietary Restrictions */}
                        <View className="bg-white p-4 rounded-xl shadow-sm">
                            <Text className="text-sm font-semibold text-gray-700 mb-2">Dietary Restrictions</Text>
                            <TextInput
                                className="text-base text-gray-800 border-b border-gray-200 pb-2"
                                value={profile.dietaryRestrictions}
                                onChangeText={(text) => setProfile(prev => ({ ...prev, dietaryRestrictions: text }))}
                                placeholder="e.g. Vegetarian, Gluten-free, Allergies..."
                                placeholderTextColor="#9CA3AF"
                                multiline
                                numberOfLines={2}
                            />
                        </View>

                        {/* Sign Out Button */}
                        <View className="pt-6 pb-8">
                            <TouchableOpacity
                                onPress={handleSignOut}
                                className="bg-red-500 p-4 rounded-xl flex-row items-center justify-center"
                            >
                                <MaterialIcons name="logout" size={20} color="white" />
                                <Text className="text-white font-semibold text-base ml-2">Sign Out</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ProfileScreen;