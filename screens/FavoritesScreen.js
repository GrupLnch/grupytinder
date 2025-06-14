import React, { useState, useEffect } from 'react';
import { Text, View, SafeAreaView, TouchableOpacity, Image, FlatList, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import useAuth from '../hooks/useAuth';
import { Ionicons, MaterialIcons, AntDesign } from "@expo/vector-icons";
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

const FavoritesScreen = () => {
    const navigation = useNavigation();
    const { user } = useAuth();
    const [favoriteRestaurants, setFavoriteRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFavoriteRestaurants = async () => {
        if (!user?.uid) {
            setLoading(false);
            return; // Cannot fetch without a user
        }

        try {
            setLoading(true);
            const q = query(
                collection(db, "users", user.uid, "likedRestaurants")
            );

            const querySnapshot = await getDocs(q);
            const favoritePlaces = [];

            querySnapshot.forEach((doc) => {
                favoritePlaces.push({
                    id: doc.id, // Use doc.id as a unique key
                    ...doc.data()
                });
            });

            setFavoriteRestaurants(favoritePlaces);
            console.log(`Loaded ${favoritePlaces.length} favorite restaurants for user ${user.uid}`);
        } catch (error) {
            console.error("Error fetching favorite restaurants:", error);
            Alert.alert("Error", "Failed to load favorite restaurants.");
        } finally {
            setLoading(false);
        }
    };

    // Refresh favorites when screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            fetchFavoriteRestaurants();
        }, [user])
    );

    // Initial load
    useEffect(() => {
        fetchFavoriteRestaurants();
    }, [user]);

    const removeFavorite = async (restaurantId) => {
        if (!user?.uid || !restaurantId) {
            Alert.alert("Error", "Cannot remove favorite without user or restaurant ID.");
            return;
        }

        Alert.alert(
            "Remove Favorite",
            "Are you sure you want to remove this from your favorites?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Remove",
                    onPress: async () => {
                        try {
                            // Delete from Firestore
                            await deleteDoc(doc(db, "users", user.uid, "likedRestaurants", restaurantId));

                            // Update local state
                            setFavoriteRestaurants(prev => prev.filter(r => r.id !== restaurantId));

                            console.log("Removed favorite:", restaurantId);
                        } catch (error) {
                            console.error("Error removing favorite restaurant:", error);
                            Alert.alert("Error", "Failed to remove favorite.");
                        }
                    },
                    style: "destructive"
                }
            ]
        );
    };

    const renderItem = ({ item }) => {
        // Safety check for item
        if (!item) {
            return null;
        }

        const photoReference = item.photos?.[0]?.photo_reference;
        const imageUrl = photoReference
            ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${process.env.GOOGLE_PLACES_API_KEY}`
            : 'https://via.placeholder.com/150';

        const openNow = item.opening_hours?.open_now;
        const rating = item.rating;
        const ratingsTotal = item.user_ratings_total;
        const vicinity = item.vicinity;

        return (
            // Main container for each grid item
            // flex: 1 makes it take up equal space in the column
            // m-1 adds margin around each item for spacing
            <View className="flex-1 m-1 bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Make the whole card tappable (optional) */}
                <TouchableOpacity onPress={() => {
                    // Add navigation to a detail screen here if you create one
                    console.log("Tapped on:", item.name);
                }}>
                    <Image
                        source={{ uri: imageUrl }}
                        className="h-32 w-full"
                        resizeMode="cover"
                    />
                    {/* Text content area */}
                    <View className="p-2">
                        <Text className="text-sm font-semibold" numberOfLines={1}>{item.name || 'Unknown'}</Text>
                        {vicinity && <Text className="text-gray-600 text-xs" numberOfLines={1}>{vicinity}</Text>}
                        <Text className="text-gray-600 text-xs">
                            {openNow !== undefined ? (openNow ? 'Open Now' : 'Closed') : 'Status Unknown'}
                        </Text>
                        {rating && (
                            <Text className="text-gray-500 text-xs mt-1">
                                ⭐ {rating.toString()} ({ratingsTotal ? ratingsTotal.toString() : '0'} reviews)
                            </Text>
                        )}
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => removeFavorite(item.id)}
                    className="absolute top-1 right-1 bg-red-500 rounded-full p-1 opacity-80"
                >
                    <MaterialIcons name="close" size={18} color="#fff" />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            <View className="flex-row items-center justify-center p-4 bg-white shadow-sm">
                <Text className="text-xl font-bold">Favorite Restaurants</Text>
            </View>

            {/* Loading Indicator */}
            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#FF5733" />
                    <Text className="mt-2 text-gray-600">Loading favorites...</Text>
                </View>
            ) : (
                <>
                    {/* No Favorites Message */}
                    {favoriteRestaurants.length === 0 && (
                        <View className="flex-1 justify-center items-center p-6">
                            <MaterialIcons name="favorite-border" size={60} color="#ccc" />
                            <Text className="text-xl text-gray-500 mt-4 text-center">
                                You haven't favorited any restaurants yet.
                            </Text>
                            <Text className="text-gray-500 mt-2 text-center">
                                Swipe right on the Discover tab to add favorites!
                            </Text>
                        </View>
                    )}

                    {/* Grid of Favorites */}
                    {favoriteRestaurants.length > 0 && Array.isArray(favoriteRestaurants) && (
                        <FlatList
                            data={favoriteRestaurants}
                            renderItem={renderItem}
                            keyExtractor={(item, index) => item?.id || `favorite-${index}`}
                            numColumns={2}
                            contentContainerStyle={{ paddingHorizontal: 4, paddingVertical: 8 }}
                        />
                    )}
                </>
            )}

        </SafeAreaView>
    );
};

export default FavoritesScreen;