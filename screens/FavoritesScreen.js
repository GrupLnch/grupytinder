import React, { useState, useEffect } from 'react';
import { Text, View, SafeAreaView, TouchableOpacity, Image, FlatList, Alert, ActivityIndicator, Linking, StyleSheet, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import useAuth from '../hooks/useAuth';
import { MaterialIcons, Ionicons, AntDesign } from "@expo/vector-icons";
import Constants from 'expo-constants';
import { getFirestore, collection, getDocs, doc, deleteDoc } from '@react-native-firebase/firestore';

const firestore = getFirestore();
const { width: SCREEN_WIDTH } = Dimensions.get('window');
// const CARD_WIDTH = SCREEN_WIDTH - 32;

const FavoritesScreen = () => {
    const { user } = useAuth();
    const [favoriteRestaurants, setFavoriteRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

    const { GOOGLE_PLACES_API_KEY } = Constants.expoConfig?.extra || {};

    const fetchFavoriteRestaurants = async () => {
        if (!user?.uid) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const querySnapshot = await getDocs(collection(firestore, 'users', user.uid, 'likedRestaurants'));

            const favoritePlaces = [];
            querySnapshot.forEach((doc) => {
                favoritePlaces.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            // Sort by savedAt date (newest first)
            favoritePlaces.sort((a, b) => {
                const dateA = a.savedAt?.toDate?.() || new Date(a.savedAt);
                const dateB = b.savedAt?.toDate?.() || new Date(b.savedAt);
                return dateB - dateA;
            });

            setFavoriteRestaurants(favoritePlaces);
            console.log(`Loaded ${favoritePlaces.length} favorite restaurants`);
        } catch (error) {
            console.error("Error fetching favorite restaurants:", error);
            Alert.alert("Error", "Failed to load favorite restaurants.");
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchFavoriteRestaurants();
        }, [user])
    );

    useEffect(() => {
        fetchFavoriteRestaurants();
    }, [user]);

    const removeFavorite = async (restaurant) => {
        if (!user?.uid || !restaurant.id) {
            Alert.alert("Error", "Cannot remove favorite.");
            return;
        }

        Alert.alert(
            "Remove Favorite",
            `Remove ${restaurant.name} from favorites?`,
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Remove",
                    onPress: async () => {
                        try {
                            // Optimistically update UI
                            setFavoriteRestaurants(prev => prev.filter(r => r.id !== restaurant.id));

                            // Delete from Firestore
                            await deleteDoc(doc(firestore, 'users', user.uid, 'likedRestaurants', restaurant.id));

                            console.log("Removed favorite:", restaurant.name);
                        } catch (error) {
                            console.error("Error removing favorite:", error);
                            Alert.alert("Error", "Failed to remove favorite.");
                            // Revert on error
                            fetchFavoriteRestaurants();
                        }
                    },
                    style: "destructive"
                }
            ]
        );
    };

    const openDirections = (restaurant) => {
        const { lat, lng } = restaurant.geometry?.location || {};
        if (lat && lng) {
            Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
        }
    };

    const renderListItem = ({ item }) => {
        if (!item) return null;

        const photoReference = item.photos?.[0]?.photo_reference;
        const imageUrl = photoReference
            ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoReference}&key=${GOOGLE_PLACES_API_KEY}`
            : 'https://via.placeholder.com/400';

        const openNow = item.opening_hours?.open_now;
        const rating = item.rating;
        // const ratingsTotal = item.user_ratings_total;
        const vicinity = item.vicinity;

        return (
            <View style={styles.listCard}>
                <Image
                    source={{ uri: imageUrl }}
                    style={styles.listImage}
                    resizeMode="cover"
                />

                <View style={styles.listContent}>
                    <View style={styles.listHeader}>
                        <View style={styles.listInfo}>
                            <Text style={styles.listTitle} numberOfLines={2}>
                                {item.name || 'Unknown Restaurant'}
                            </Text>

                            {vicinity && (
                                <Text style={styles.listAddress} numberOfLines={1}>
                                    📍 {vicinity}
                                </Text>
                            )}

                            <View style={styles.listMeta}>
                                {rating && (
                                    <View style={styles.ratingBadge}>
                                        <Text style={styles.ratingText}>
                                            ⭐ {rating}
                                        </Text>
                                    </View>
                                )}

                                <View style={[styles.statusBadge, openNow ? styles.openBadge : styles.closedBadge]}>
                                    <Text style={styles.statusText}>
                                        {openNow !== undefined ? (openNow ? 'Open' : 'Closed') : 'Unknown'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={styles.listActions}>
                        <TouchableOpacity
                            style={styles.directionsBtn}
                            onPress={() => openDirections(item)}
                        >
                            <MaterialIcons name="directions" size={20} color="#3b82f6" />
                            <Text style={styles.directionsBtnText}>Directions</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.removeBtn}
                            onPress={() => removeFavorite(item)}
                        >
                            <MaterialIcons name="delete-outline" size={20} color="#ef4444" />
                            <Text style={styles.removeBtnText}>Remove</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    const renderGridItem = ({ item }) => {
        if (!item) return null;

        const photoReference = item.photos?.[0]?.photo_reference;
        const imageUrl = photoReference
            ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${GOOGLE_PLACES_API_KEY}`
            : 'https://via.placeholder.com/400';

        const openNow = item.opening_hours?.open_now;
        const rating = item.rating;

        return (
            <View style={styles.gridCard}>
                <Image
                    source={{ uri: imageUrl }}
                    style={styles.gridImage}
                    resizeMode="cover"
                />

                <TouchableOpacity
                    style={styles.gridRemoveBtn}
                    onPress={() => removeFavorite(item)}
                >
                    <MaterialIcons name="close" size={20} color="white" />
                </TouchableOpacity>

                <View style={styles.gridContent}>
                    <Text style={styles.gridTitle} numberOfLines={2}>
                        {item.name || 'Unknown'}
                    </Text>

                    <View style={styles.gridMeta}>
                        {rating && (
                            <Text style={styles.gridRating}>⭐ {rating}</Text>
                        )}
                        {openNow !== undefined && (
                            <View style={[styles.gridStatus, openNow ? styles.openDot : styles.closedDot]} />
                        )}
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>My Favorites</Text>
                    <Text style={styles.headerSubtitle}>
                        {favoriteRestaurants.length} {favoriteRestaurants.length === 1 ? 'restaurant' : 'restaurants'}
                    </Text>
                </View>

                <View style={styles.viewToggle}>
                    <TouchableOpacity
                        style={[styles.viewBtn, viewMode === 'list' && styles.viewBtnActive]}
                        onPress={() => setViewMode('list')}
                    >
                        <Ionicons
                            name="list"
                            size={22}
                            color={viewMode === 'list' ? '#3b82f6' : '#94a3b8'}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.viewBtn, viewMode === 'grid' && styles.viewBtnActive]}
                        onPress={() => setViewMode('grid')}
                    >
                        <Ionicons
                            name="grid"
                            size={22}
                            color={viewMode === 'grid' ? '#3b82f6' : '#94a3b8'}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Content */}
            {loading ? (
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color="#3b82f6" />
                    <Text style={styles.loadingText}>Loading favorites...</Text>
                </View>
            ) : favoriteRestaurants.length === 0 ? (
                <View style={styles.centerContent}>
                    <View style={styles.emptyIcon}>
                        <AntDesign name="hearto" size={64} color="#cbd5e1" />
                    </View>
                    <Text style={styles.emptyTitle}>No Favorites Yet</Text>
                    <Text style={styles.emptySubtitle}>
                        Swipe right on restaurants you love to add them here!
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={favoriteRestaurants}
                    renderItem={viewMode === 'list' ? renderListItem : renderGridItem}
                    keyExtractor={(item, index) => item?.id || `favorite-${index}`}
                    numColumns={viewMode === 'grid' ? 2 : 1}
                    key={viewMode} // Force remount when changing view mode
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 20,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 4,
    },
    viewToggle: {
        flexDirection: 'row',
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        padding: 4,
        gap: 4,
    },
    viewBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    viewBtnActive: {
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    listContainer: {
        padding: 16,
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#64748b',
    },
    emptyIcon: {
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 24,
    },

    // List View Styles
    listCard: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    listImage: {
        width: 120,
        height: '100%',
        minHeight: 140,
    },
    listContent: {
        flex: 1,
        padding: 16,
        justifyContent: 'space-between',
    },
    listHeader: {
        flex: 1,
    },
    listInfo: {
        flex: 1,
    },
    listTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 6,
    },
    listAddress: {
        fontSize: 13,
        color: '#64748b',
        marginBottom: 10,
    },
    listMeta: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
    },
    ratingBadge: {
        backgroundColor: '#fef3c7',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    ratingText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#92400e',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    openBadge: {
        backgroundColor: '#d1fae5',
    },
    closedBadge: {
        backgroundColor: '#fee2e2',
    },
    statusText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#065f46',
    },
    listActions: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 12,
    },
    directionsBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#eff6ff',
        paddingVertical: 10,
        borderRadius: 10,
        gap: 6,
    },
    directionsBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#3b82f6',
    },
    removeBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fef2f2',
        paddingVertical: 10,
        borderRadius: 10,
        gap: 6,
    },
    removeBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#ef4444',
    },

    // Grid View Styles
    gridCard: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 16,
        margin: 8,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        maxWidth: (SCREEN_WIDTH - 48) / 2,
    },
    gridImage: {
        width: '100%',
        height: 140,
    },
    gridRemoveBtn: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(239, 68, 68, 0.9)',
        borderRadius: 20,
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    gridContent: {
        padding: 12,
    },
    gridTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 8,
        minHeight: 40,
    },
    gridMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    gridRating: {
        fontSize: 13,
        fontWeight: '600',
        color: '#92400e',
    },
    gridStatus: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    openDot: {
        backgroundColor: '#10b981',
    },
    closedDot: {
        backgroundColor: '#ef4444',
    },
});

export default FavoritesScreen;