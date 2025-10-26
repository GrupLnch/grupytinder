import React, { useState, useEffect } from 'react';
import { Text, View, SafeAreaView, TouchableOpacity, Image, Alert, Linking, Dimensions, StyleSheet, Modal, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import useAuth from '../hooks/useAuth';
import { MaterialIcons, AntDesign, Ionicons } from "@expo/vector-icons";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    useAnimatedGestureHandler,
    withSpring,
    withTiming,
    runOnJS,
    interpolate,
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { fetchNearbyRestaurants, getPlaceholderImage } from '../utils/placesApi';
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc, serverTimestamp, getDoc } from '@react-native-firebase/firestore';

const firestore = getFirestore();
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

const HomeScreen = () => {
    const navigation = useNavigation();
    const { user } = useAuth();

    const [restaurants, setRestaurants] = useState([]);
    const [allRestaurants, setAllRestaurants] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [likedRestaurants, setLikedRestaurants] = useState([]);
    const [seenRestaurants, setSeenRestaurants] = useState(new Set());
    const [showFilters, setShowFilters] = useState(false);
    const [showEmptyState, setShowEmptyState] = useState(false);
    const [userStats, setUserStats] = useState({
        totalSeen: 0,
        totalLiked: 0,
        streak: 0
    });
    const [searchRadius, setSearchRadius] = useState(1500);
    const [filters, setFilters] = useState({
        openNow: false,
        rating4Plus: false,
        rating3Plus: false,
        american: false,
        italian: false,
        mexican: false,
        chinese: false,
        japanese: false,
        indian: false,
        thai: false,
        breakfast: false,
        lunch: false,
        dinner: false,
        dessert: false,
        vegetarian: false,
        vegan: false,
        budget: false,
        moderate: false,
        expensive: false,
        casual: false,
        formal: false,
        romantic: false,
        family: false,
        includePreviouslySeen: false,
    });

    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const rotateZ = useSharedValue(0);

    // Load restaurants and seen history
    useEffect(() => {
        const loadRestaurants = async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Using default location');
                const mockLocation = '37.7749,-122.4194';
                const results = await fetchNearbyRestaurants(mockLocation, searchRadius);
                setAllRestaurants(results);
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const coords = `${location.coords.latitude},${location.coords.longitude}`;
            const results = await fetchNearbyRestaurants(coords, searchRadius);
            setAllRestaurants(results);
        };

        loadRestaurants();
    }, [searchRadius]);

    // Load seen restaurants from Firebase
    useEffect(() => {
        const loadSeenRestaurants = async () => {
            if (!user?.uid) return;

            try {
                const seenRef = collection(firestore, 'users', user.uid, 'seenRestaurants');
                const seenSnapshot = await getDocs(seenRef);

                const seenIds = new Set();
                seenSnapshot.forEach(doc => {
                    seenIds.add(doc.id);
                });

                setSeenRestaurants(seenIds);
                console.log(`Loaded ${seenIds.size} previously seen restaurants`);
            } catch (error) {
                console.error("Error loading seen restaurants:", error);
            }
        };

        loadSeenRestaurants();
    }, [user]);

    // Load user stats
    useEffect(() => {
        const loadUserStats = async () => {
            if (!user?.uid) return;

            try {
                const statsRef = doc(firestore, 'users', user.uid, 'stats', 'summary');
                const statsDoc = await getDoc(statsRef);

                if (statsDoc.exists()) {
                    setUserStats(statsDoc.data());
                }
            } catch (error) {
                console.error("Error loading stats:", error);
            }
        };

        loadUserStats();
    }, [user]);

    // Apply filters
    useEffect(() => {
        applyFilters();
    }, [filters, allRestaurants, seenRestaurants]);

    const applyFilters = () => {
        if (!allRestaurants.length) return;

        let filtered = [...allRestaurants];

        // Filter out seen restaurants UNLESS the toggle is on
        if (!filters.includePreviouslySeen) {
            filtered = filtered.filter(r => !seenRestaurants.has(r.place_id));
        }

        // Apply other filters
        const hasActiveFilters = Object.keys(filters).some(
            key => key !== 'includePreviouslySeen' && filters[key]
        );

        if (hasActiveFilters) {
            filtered = filtered.filter(restaurant => {
                const name = restaurant.name?.toLowerCase() || '';
                const types = restaurant.types || [];
                const rating = restaurant.rating || 0;

                if (filters.openNow && !restaurant.opening_hours?.open_now) return false;
                if (filters.rating4Plus && rating < 4.0) return false;
                if (filters.rating3Plus && rating < 3.0) return false;
                if (filters.american && !name.includes('american') && !name.includes('burger') && !name.includes('grill')) return false;
                if (filters.italian && !name.includes('italian') && !name.includes('pizza') && !name.includes('pasta')) return false;
                if (filters.mexican && !name.includes('mexican') && !name.includes('taco') && !name.includes('burrito')) return false;
                if (filters.chinese && !name.includes('chinese') && !name.includes('wok')) return false;
                if (filters.japanese && !name.includes('japanese') && !name.includes('sushi') && !name.includes('ramen')) return false;
                if (filters.indian && !name.includes('indian') && !name.includes('curry')) return false;
                if (filters.thai && !name.includes('thai') && !name.includes('pad thai')) return false;
                if (filters.breakfast && !name.includes('breakfast') && !name.includes('cafe') && !types.includes('cafe')) return false;
                if (filters.lunch && !types.includes('restaurant') && !types.includes('meal_takeaway')) return false;
                if (filters.dinner && !types.includes('restaurant') && !types.includes('night_club')) return false;
                if (filters.dessert && !name.includes('dessert') && !name.includes('ice cream') && !name.includes('bakery') && !types.includes('bakery')) return false;
                if (filters.vegetarian && !name.includes('vegetarian') && !name.includes('veg') && !name.includes('salad')) return false;
                if (filters.vegan && !name.includes('vegan')) return false;
                if (filters.budget && rating > 3.5) return false;
                if (filters.moderate && (rating < 3.5 || rating > 4.3)) return false;
                if (filters.expensive && rating < 4.0) return false;
                if (filters.casual && rating > 4.3) return false;
                if (filters.formal && rating < 4.0) return false;
                if (filters.romantic && rating < 4.0) return false;
                if (filters.family && (!types.includes('restaurant') || rating < 3.5)) return false;

                return true;
            });
        }

        // Mark seen restaurants with a flag
        const enhancedFiltered = filtered.map(r => ({
            ...r,
            wasSeen: seenRestaurants.has(r.place_id)
        }));

        setRestaurants(enhancedFiltered);
        setCurrentIndex(0);
        setShowEmptyState(enhancedFiltered.length === 0);
    };

    const resetFilters = () => {
        setFilters({
            openNow: false,
            rating4Plus: false,
            rating3Plus: false,
            american: false,
            italian: false,
            mexican: false,
            chinese: false,
            japanese: false,
            indian: false,
            thai: false,
            breakfast: false,
            lunch: false,
            dinner: false,
            dessert: false,
            vegetarian: false,
            vegan: false,
            budget: false,
            moderate: false,
            expensive: false,
            casual: false,
            formal: false,
            romantic: false,
            family: false,
            includePreviouslySeen: false,
        });
    };

    const toggleFilter = (key) => {
        setFilters(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const expandSearchArea = async () => {
        const newRadius = searchRadius + 1500;
        setSearchRadius(newRadius);
        Alert.alert("Search Expanded", `Now searching within ${(newRadius / 1609).toFixed(1)} miles`);
    };

    const resetProgress = () => {
        Alert.alert(
            "Reset Progress",
            "This will let you swipe through all restaurants again. Continue?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Reset",
                    style: "destructive",
                    onPress: async () => {
                        if (!user?.uid) return;

                        try {
                            // Clear seen restaurants
                            const seenRef = collection(firestore, 'users', user.uid, 'seenRestaurants');
                            const snapshot = await getDocs(seenRef);

                            const deletePromises = [];
                            snapshot.forEach(doc => {
                                deletePromises.push(deleteDoc(doc.ref));
                            });

                            await Promise.all(deletePromises);

                            setSeenRestaurants(new Set());
                            setShowEmptyState(false);
                            Alert.alert("Success", "Your progress has been reset!");
                        } catch (error) {
                            console.error("Error resetting progress:", error);
                            Alert.alert("Error", "Failed to reset progress");
                        }
                    }
                }
            ]
        );
    };

    // Mark restaurant as seen
    const markAsSeen = async (restaurant, action) => {
        if (!user?.uid || !restaurant?.place_id) return;

        try {
            await setDoc(doc(firestore, 'users', user.uid, 'seenRestaurants', restaurant.place_id), {
                name: restaurant.name,
                action,
                timestamp: serverTimestamp()
            });

            setSeenRestaurants(prev => new Set([...prev, restaurant.place_id]));

            // Update stats
            const newStats = {
                totalSeen: userStats.totalSeen + 1,
                totalLiked: action === 'liked' ? userStats.totalLiked + 1 : userStats.totalLiked,
                lastActive: serverTimestamp()
            };

            await setDoc(doc(firestore, 'users', user.uid, 'stats', 'summary'), newStats, { merge: true });
            setUserStats(prev => ({ ...prev, ...newStats }));
        } catch (error) {
            console.error("Error marking as seen:", error);
        }
    };

    // Load liked restaurants
    useEffect(() => {
        const fetchLikedRestaurants = async () => {
            if (!user?.uid) return;

            try {
                const querySnapshot = await getDocs(collection(firestore, 'users', user.uid, 'likedRestaurants'));
                const likedPlaces = [];
                querySnapshot.forEach((doc) => {
                    likedPlaces.push({ id: doc.id, ...doc.data() });
                });
                setLikedRestaurants(likedPlaces);
            } catch (error) {
                console.error("Error fetching liked restaurants:", error);
            }
        };

        fetchLikedRestaurants();
    }, [user]);

    const saveLikedRestaurant = async (restaurant) => {
        if (!user?.uid) {
            Alert.alert("Not logged in", "Please login to save favorites");
            return;
        }

        try {
            const restaurantData = {
                place_id: restaurant.place_id,
                name: restaurant.name,
                vicinity: restaurant.vicinity,
                rating: restaurant.rating,
                user_ratings_total: restaurant.user_ratings_total,
                photos: restaurant.photos,
                geometry: restaurant.geometry,
                opening_hours: restaurant.opening_hours,
                savedAt: serverTimestamp(),
            };

            await setDoc(doc(firestore, 'users', user.uid, 'likedRestaurants', restaurant.place_id), restaurantData);
            setLikedRestaurants(prev => [...prev, restaurantData]);
            console.log("Liked:", restaurant.name);
        } catch (error) {
            console.error("Error saving liked restaurant:", error);
        }
    };

    const removeRestaurantFromLikes = async (restaurant) => {
        if (!user?.uid || !restaurant?.place_id) return;

        try {
            const isLiked = likedRestaurants.some(r => r.place_id === restaurant.place_id);
            if (isLiked) {
                await deleteDoc(doc(firestore, 'users', user.uid, 'likedRestaurants', restaurant.place_id));
                setLikedRestaurants(prev => prev.filter(r => r.place_id !== restaurant.place_id));
                console.log("Removed:", restaurant.name);
            }
        } catch (error) {
            console.error("Error removing restaurant:", error);
        }
    };

    const onSwipedLeft = (index) => {
        const restaurant = restaurants[index];
        removeRestaurantFromLikes(restaurant);
        markAsSeen(restaurant, 'passed');
        console.log('Disliked:', restaurant?.name);
    };

    const onSwipedRight = (index) => {
        const restaurant = restaurants[index];
        saveLikedRestaurant(restaurant);
        markAsSeen(restaurant, 'liked');
        console.log('Liked:', restaurant?.name);
    };

    const handleSwipe = (direction) => {
        if (currentIndex >= restaurants.length) return;

        const toValue = direction === 'left' ? -SCREEN_WIDTH * 1.5 : SCREEN_WIDTH * 1.5;

        translateX.value = withTiming(toValue, { duration: 300 }, (finished) => {
            if (finished) {
                runOnJS(direction === 'left' ? onSwipedLeft : onSwipedRight)(currentIndex);
                runOnJS(setCurrentIndex)(currentIndex + 1);
                translateX.value = 0;
                translateY.value = 0;
                rotateZ.value = 0;
            }
        });
    };

    const gestureHandler = useAnimatedGestureHandler({
        onStart: (_, context) => {
            context.startX = translateX.value;
            context.startY = translateY.value;
        },
        onActive: (event, context) => {
            translateX.value = context.startX + event.translationX;
            translateY.value = context.startY + event.translationY;
            rotateZ.value = interpolate(
                translateX.value,
                [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
                [-10, 0, 10]
            );
        },
        onEnd: () => {
            const shouldSwipeLeft = translateX.value < -SWIPE_THRESHOLD;
            const shouldSwipeRight = translateX.value > SWIPE_THRESHOLD;

            if (shouldSwipeLeft) {
                translateX.value = withTiming(-SCREEN_WIDTH * 1.5, { duration: 300 }, (finished) => {
                    if (finished) {
                        runOnJS(onSwipedLeft)(currentIndex);
                        runOnJS(setCurrentIndex)(currentIndex + 1);
                        translateX.value = 0;
                        translateY.value = 0;
                        rotateZ.value = 0;
                    }
                });
            } else if (shouldSwipeRight) {
                translateX.value = withTiming(SCREEN_WIDTH * 1.5, { duration: 300 }, (finished) => {
                    if (finished) {
                        runOnJS(onSwipedRight)(currentIndex);
                        runOnJS(setCurrentIndex)(currentIndex + 1);
                        translateX.value = 0;
                        translateY.value = 0;
                        rotateZ.value = 0;
                    }
                });
            } else {
                translateX.value = withSpring(0);
                translateY.value = withSpring(0);
                rotateZ.value = withSpring(0);
            }
        },
    });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { rotateZ: `${rotateZ.value}deg` },
        ],
    }));

    const renderCard = (card, index) => {
        if (!card) return null;

        const imageUrl = card.photoUrl || getPlaceholderImage(card.name);
        const openNow = card.opening_hours?.open_now;
        const rating = card.rating;
        const ratingsTotal = card.user_ratings_total;
        const offset = index - currentIndex;

        return (
            <View
                key={card.place_id}
                style={[
                    styles.card,
                    {
                        transform: [
                            { scale: 1 - offset * 0.05 },
                            { translateY: offset * 10 },
                        ],
                        zIndex: 1000 - offset,
                        opacity: offset > 2 ? 0 : 1,
                    }
                ]}
            >
                <Image
                    source={{ uri: imageUrl }}
                    style={styles.cardImage}
                    resizeMode="cover"
                />

                {/* Seen Badge */}
                {card.wasSeen && (
                    <View style={styles.seenBadge}>
                        <Ionicons name="eye" size={14} color="white" />
                        <Text style={styles.seenBadgeText}>SEEN</Text>
                    </View>
                )}

                <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle} numberOfLines={2}>
                        {card.name || 'Unknown Restaurant'}
                    </Text>

                    <View style={styles.statusBadge}>
                        <Text style={[styles.statusText, { color: openNow ? '#10b981' : '#ef4444' }]}>
                            {openNow !== undefined ? (openNow ? 'Open Now' : 'Closed') : 'Status Unknown'}
                        </Text>
                    </View>

                    {rating && (
                        <Text style={styles.ratingText}>
                            ⭐ {rating} ({ratingsTotal || 0} reviews)
                        </Text>
                    )}

                    <View style={styles.serviceIcons}>
                        <View style={styles.iconRow}>
                            <Text style={styles.emoji}>🚗</Text>
                            <Text style={styles.emoji}>🥡</Text>
                            <Text style={styles.emoji}>🍽️</Text>
                        </View>

                        <TouchableOpacity
                            onPress={() => {
                                const { lat, lng } = card.geometry?.location || {};
                                if (lat && lng) {
                                    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
                                }
                            }}
                            style={styles.directionsButton}
                        >
                            <MaterialIcons name="directions" size={28} color="#3b82f6" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} testID="home-screen-view">
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                    <Image
                        style={styles.profileImage}
                        source={{ uri: user?.photoURL || 'https://via.placeholder.com/150' }}
                    />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Grup Lnch</Text>

                <TouchableOpacity onPress={() => setShowFilters(true)} style={styles.filterButton}>
                    <Ionicons name="options" size={28} color="#64748b" />
                    {Object.values(filters).some(v => v) && (
                        <View style={styles.filterBadge} />
                    )}
                </TouchableOpacity>
            </View>

            <View style={styles.cardsContainer}>
                {showEmptyState ? (
                    // EMPTY STATE WITH GAMIFICATION
                    <View style={styles.emptyStateContainer}>
                        <Text style={styles.emptyStateEmoji}>🎉</Text>
                        <Text style={styles.emptyStateTitle}>You&apos;ve Explored All Nearby!</Text>

                        <View style={styles.statsCard}>
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>{userStats.totalSeen}</Text>
                                <Text style={styles.statLabel}>Discovered</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={[styles.statNumber, { color: '#22c55e' }]}>{userStats.totalLiked}</Text>
                                <Text style={styles.statLabel}>Favorites</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={[styles.statNumber, { color: '#f59e0b' }]}>{userStats.streak || 0}</Text>
                                <Text style={styles.statLabel}>Day Streak</Text>
                            </View>
                        </View>

                        <View style={styles.emptyStateActions}>
                            <TouchableOpacity style={styles.emptyActionButton} onPress={expandSearchArea}>
                                <Ionicons name="map" size={24} color="#3b82f6" />
                                <Text style={styles.emptyActionText}>Expand Area</Text>
                                <Text style={styles.emptyActionSubtext}>+1.5 miles</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.emptyActionButton} onPress={resetProgress}>
                                <Ionicons name="refresh" size={24} color="#8b5cf6" />
                                <Text style={styles.emptyActionText}>Start Over</Text>
                                <Text style={styles.emptyActionSubtext}>Re-swipe all</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.emptyActionButton}
                                onPress={() => navigation.navigate('Favorites')}
                            >
                                <AntDesign name="heart" size={24} color="#ef4444" />
                                <Text style={styles.emptyActionText}>My Favorites</Text>
                                <Text style={styles.emptyActionSubtext}>{likedRestaurants.length} saved</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : restaurants.length > 0 && currentIndex < restaurants.length ? (
                    <View style={styles.cardStack}>
                        {restaurants.slice(currentIndex + 1, currentIndex + 3).map((restaurant, i) =>
                            renderCard(restaurant, currentIndex + i + 1)
                        )}

                        <PanGestureHandler onGestureEvent={gestureHandler}>
                            <Animated.View style={[styles.card, { zIndex: 1000 }, animatedStyle]}>
                                <View style={styles.cardInner}>
                                    <Image
                                        source={{
                                            uri: restaurants[currentIndex].photoUrl ||
                                                 getPlaceholderImage(restaurants[currentIndex].name)
                                        }}
                                        style={styles.cardImage}
                                        resizeMode="cover"
                                    />

                                    {restaurants[currentIndex].wasSeen && (
                                        <View style={styles.seenBadge}>
                                            <Ionicons name="eye" size={14} color="white" />
                                            <Text style={styles.seenBadgeText}>SEEN</Text>
                                        </View>
                                    )}

                                    <View style={styles.cardInfo}>
                                        <Text style={styles.cardTitle} numberOfLines={2}>
                                            {restaurants[currentIndex].name || 'Unknown Restaurant'}
                                        </Text>
                                        <View style={styles.statusBadge}>
                                            <Text style={[styles.statusText, {
                                                color: restaurants[currentIndex].opening_hours?.open_now ? '#10b981' : '#ef4444'
                                            }]}>
                                                {restaurants[currentIndex].opening_hours?.open_now ? 'Open Now' : 'Closed'}
                                            </Text>
                                        </View>
                                        {restaurants[currentIndex].rating && (
                                            <Text style={styles.ratingText}>
                                                ⭐ {restaurants[currentIndex].rating} ({restaurants[currentIndex].user_ratings_total || 0} reviews)
                                            </Text>
                                        )}
                                        <View style={styles.serviceIcons}>
                                            <View style={styles.iconRow}>
                                                <Text style={styles.emoji}>🚗</Text>
                                                <Text style={styles.emoji}>🥡</Text>
                                                <Text style={styles.emoji}>🍽️</Text>
                                            </View>
                                            <TouchableOpacity
                                                onPress={() => {
                                                    const { lat, lng } = restaurants[currentIndex].geometry?.location || {};
                                                    if (lat && lng) {
                                                        Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
                                                    }
                                                }}
                                                style={styles.directionsButton}
                                            >
                                                <MaterialIcons name="directions" size={28} color="#3b82f6" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            </Animated.View>
                        </PanGestureHandler>
                    </View>
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>Loading restaurants...</Text>
                    </View>
                )}
            </View>

            <View style={styles.actionButtons}>
                <TouchableOpacity
                    onPress={() => handleSwipe('left')}
                    style={[styles.actionButton, styles.dislikeButton]}
                    disabled={showEmptyState}
                >
                    <AntDesign name="close" size={32} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => handleSwipe('right')}
                    style={[styles.actionButton, styles.likeButton]}
                    disabled={showEmptyState}
                >
                    <AntDesign name="heart" size={32} color="white" />
                </TouchableOpacity>
            </View>

            {/* FILTER MODAL */}
            <Modal
                visible={showFilters}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowFilters(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Filters</Text>
                            <TouchableOpacity onPress={() => setShowFilters(false)}>
                                <Ionicons name="close" size={28} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.filterOptions} showsVerticalScrollIndicator={false}>
                            {/* NEW: Include Previously Seen Toggle */}
                            <View style={styles.revisitSection}>
                                <View style={styles.revisitHeader}>
                                    <Ionicons name="refresh-circle" size={24} color="#8b5cf6" />
                                    <Text style={styles.revisitTitle}>Revisit Mode</Text>
                                </View>
                                <TouchableOpacity
                                    style={styles.filterOption}
                                    onPress={() => toggleFilter('includePreviouslySeen')}
                                >
                                    <View>
                                        <Text style={styles.filterLabel}>Include Previously Seen</Text>
                                        <Text style={styles.filterSubtext}>
                                            {filters.includePreviouslySeen
                                                ? 'Showing all restaurants'
                                                : 'Only showing new restaurants'}
                                        </Text>
                                    </View>
                                    <View style={[
                                        styles.toggle,
                                        filters.includePreviouslySeen && styles.toggleActive
                                    ]}>
                                        <View style={[
                                            styles.toggleThumb,
                                            filters.includePreviouslySeen && styles.toggleThumbActive
                                        ]} />
                                    </View>
                                </TouchableOpacity>
                            </View>

                            {/* Rest of filters... */}
                            <Text style={styles.sectionTitle}>⏰ Availability</Text>
                            <TouchableOpacity style={styles.filterOption} onPress={() => toggleFilter('openNow')}>
                                <Text style={styles.filterLabel}>Open Now</Text>
                                <View style={[styles.checkbox, filters.openNow && styles.checkboxActive]}>
                                    {filters.openNow && <Ionicons name="checkmark" size={20} color="white" />}
                                </View>
                            </TouchableOpacity>

                            {/* Rating */}
                            <Text style={styles.sectionTitle}>⭐ Rating</Text>
                            <TouchableOpacity style={styles.filterOption} onPress={() => toggleFilter('rating4Plus')}>
                                <Text style={styles.filterLabel}>4.0+ Stars</Text>
                                <View style={[styles.checkbox, filters.rating4Plus && styles.checkboxActive]}>
                                    {filters.rating4Plus && <Ionicons name="checkmark" size={20} color="white" />}
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.filterOption} onPress={() => toggleFilter('rating3Plus')}>
                                <Text style={styles.filterLabel}>3.0+ Stars</Text>
                                <View style={[styles.checkbox, filters.rating3Plus && styles.checkboxActive]}>
                                    {filters.rating3Plus && <Ionicons name="checkmark" size={20} color="white" />}
                                </View>
                            </TouchableOpacity>

                            {/* Cuisine Type */}
                            <Text style={styles.sectionTitle}>🍽️ Cuisine Type</Text>
                            <View style={styles.chipContainer}>
                                {[
                                    { key: 'american', label: 'American', icon: '🍔' },
                                    { key: 'italian', label: 'Italian', icon: '🍕' },
                                    { key: 'mexican', label: 'Mexican', icon: '🌮' },
                                    { key: 'chinese', label: 'Chinese', icon: '🥡' },
                                    { key: 'japanese', label: 'Japanese', icon: '🍣' },
                                    { key: 'indian', label: 'Indian', icon: '🍛' },
                                    { key: 'thai', label: 'Thai', icon: '🍜' },
                                ].map(cuisine => (
                                    <TouchableOpacity
                                        key={cuisine.key}
                                        style={[styles.chip, filters[cuisine.key] && styles.chipActive]}
                                        onPress={() => toggleFilter(cuisine.key)}
                                    >
                                        <Text style={styles.chipEmoji}>{cuisine.icon}</Text>
                                        <Text style={[styles.chipText, filters[cuisine.key] && styles.chipTextActive]}>
                                            {cuisine.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Meal Type */}
                            <Text style={styles.sectionTitle}>🕐 Meal Type</Text>
                            <View style={styles.chipContainer}>
                                {[
                                    { key: 'breakfast', label: 'Breakfast', icon: '🥞' },
                                    { key: 'lunch', label: 'Lunch', icon: '🥗' },
                                    { key: 'dinner', label: 'Dinner', icon: '🍽️' },
                                    { key: 'dessert', label: 'Dessert', icon: '🍰' },
                                ].map(meal => (
                                    <TouchableOpacity
                                        key={meal.key}
                                        style={[styles.chip, filters[meal.key] && styles.chipActive]}
                                        onPress={() => toggleFilter(meal.key)}
                                    >
                                        <Text style={styles.chipEmoji}>{meal.icon}</Text>
                                        <Text style={[styles.chipText, filters[meal.key] && styles.chipTextActive]}>
                                            {meal.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Dietary */}
                            <Text style={styles.sectionTitle}>🥬 Dietary Preferences</Text>
                            <View style={styles.chipContainer}>
                                {[
                                    { key: 'vegetarian', label: 'Vegetarian', icon: '🥗' },
                                    { key: 'vegan', label: 'Vegan', icon: '🌱' },
                                ].map(diet => (
                                    <TouchableOpacity
                                        key={diet.key}
                                        style={[styles.chip, filters[diet.key] && styles.chipActive]}
                                        onPress={() => toggleFilter(diet.key)}
                                    >
                                        <Text style={styles.chipEmoji}>{diet.icon}</Text>
                                        <Text style={[styles.chipText, filters[diet.key] && styles.chipTextActive]}>
                                            {diet.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Price Range */}
                            <Text style={styles.sectionTitle}>💰 Price Range</Text>
                            <View style={styles.chipContainer}>
                                {[
                                    { key: 'budget', label: 'Budget', icon: '$' },
                                    { key: 'moderate', label: 'Moderate', icon: '$$' },
                                    { key: 'expensive', label: 'Upscale', icon: '$$$' },
                                ].map(price => (
                                    <TouchableOpacity
                                        key={price.key}
                                        style={[styles.chip, filters[price.key] && styles.chipActive]}
                                        onPress={() => toggleFilter(price.key)}
                                    >
                                        <Text style={[styles.chipText, filters[price.key] && styles.chipTextActive]}>
                                            {price.icon} {price.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Atmosphere */}
                            <Text style={styles.sectionTitle}>✨ Atmosphere</Text>
                            <View style={styles.chipContainer}>
                                {[
                                    { key: 'casual', label: 'Casual', icon: '👕' },
                                    { key: 'formal', label: 'Formal', icon: '🎩' },
                                    { key: 'romantic', label: 'Romantic', icon: '💕' },
                                    { key: 'family', label: 'Family-Friendly', icon: '👨‍👩‍👧‍👦' },
                                ].map(vibe => (
                                    <TouchableOpacity
                                        key={vibe.key}
                                        style={[styles.chip, filters[vibe.key] && styles.chipActive]}
                                        onPress={() => toggleFilter(vibe.key)}
                                    >
                                        <Text style={styles.chipEmoji}>{vibe.icon}</Text>
                                        <Text style={[styles.chipText, filters[vibe.key] && styles.chipTextActive]}>
                                            {vibe.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <View style={{ height: 20 }} />
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.resetFiltersButton}
                                onPress={resetFilters}
                            >
                                <Text style={styles.resetFiltersText}>Reset All</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.applyButton}
                                onPress={() => setShowFilters(false)}
                            >
                                <Text style={styles.applyButtonText}>
                                    Apply ({restaurants.length} restaurants)
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#64748b',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
    },
    profileImage: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: '#e2e8f0',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    filterButton: {
        position: 'relative',
    },
    filterBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#ef4444',
    },
    cardsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardStack: {
        width: SCREEN_WIDTH - 48,
        height: 420,
        position: 'relative',
    },
    card: {
        position: 'absolute',
        width: SCREEN_WIDTH - 48,
        height: 420,
        backgroundColor: 'white',
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 10,
        overflow: 'hidden',
    },
    cardInner: {
        flex: 1,
    },
    cardImage: {
        width: '100%',
        height: 240,
    },
    seenBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(139, 92, 246, 0.9)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 4,
    },
    seenBadgeText: {
        color: 'white',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    cardInfo: {
        padding: 20,
        flex: 1,
    },
    cardTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 8,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '600',
    },
    ratingText: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 12,
    },
    serviceIcons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 'auto',
    },
    iconRow: {
        flexDirection: 'row',
        gap: 8,
    },
    emoji: {
        fontSize: 24,
    },
    directionsButton: {
        backgroundColor: '#dbeafe',
        borderRadius: 50,
        width: 56,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 32,
        gap: 80,
    },
    actionButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    dislikeButton: {
        backgroundColor: '#ef4444',
    },
    likeButton: {
        backgroundColor: '#22c55e',
    },
    emptyState: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 18,
        color: 'white',
        marginBottom: 16,
    },

    // NEW: Empty State Styles
    emptyStateContainer: {
        alignItems: 'center',
        paddingHorizontal: 32,
        width: '100%',
    },
    emptyStateEmoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyStateTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 24,
        textAlign: 'center',
    },
    statsCard: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        marginBottom: 32,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 6,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#3b82f6',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 13,
        color: '#64748b',
        fontWeight: '600',
    },
    statDivider: {
        width: 1,
        backgroundColor: '#e2e8f0',
        marginHorizontal: 8,
    },
    emptyStateActions: {
        width: '100%',
        gap: 12,
    },
    emptyActionButton: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    emptyActionText: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
    },
    emptyActionSubtext: {
        fontSize: 13,
        color: '#64748b',
        fontWeight: '500',
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    filterOptions: {
        padding: 20,
    },

    // NEW: Revisit Section Styles
    revisitSection: {
        backgroundColor: '#f8f9ff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        borderWidth: 2,
        borderColor: '#e0e7ff',
    },
    revisitHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    revisitTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#8b5cf6',
    },
    filterSubtext: {
        fontSize: 13,
        color: '#64748b',
        marginTop: 2,
    },
    toggle: {
        width: 52,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#cbd5e1',
        justifyContent: 'center',
        padding: 2,
    },
    toggleActive: {
        backgroundColor: '#8b5cf6',
    },
    toggleThumb: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    toggleThumbActive: {
        transform: [{ translateX: 24 }],
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
        marginTop: 12,
        marginBottom: 12,
    },
    filterOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    filterLabel: {
        fontSize: 16,
        color: '#475569',
        fontWeight: '500',
    },
    checkbox: {
        width: 28,
        height: 28,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#cbd5e1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxActive: {
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 8,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
        borderWidth: 2,
        borderColor: '#e2e8f0',
        gap: 6,
    },
    chipActive: {
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
    },
    chipEmoji: {
        fontSize: 16,
    },
    chipText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
    },
    chipTextActive: {
        color: 'white',
    },
    modalFooter: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    resetFiltersButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        alignItems: 'center',
    },
    resetFiltersText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#64748b',
    },
    applyButton: {
        flex: 2,
        backgroundColor: '#3b82f6',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    applyButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
});

export default HomeScreen;