import '@testing-library/jest-native/extend-expect';

// Must be at the very top before any other imports
global.__reanimatedWorkletInit = jest.fn();

global.console = {
    ...console,
    // Suppress specific warnings
    error: jest.fn((message) => {
        if (
            typeof message === 'string' &&
            message.includes('Warning: An update to') &&
            message.includes('was not wrapped in act')
        ) {
            return;
        }
        console.error(message);
    }),
    warn: jest.fn(),
};

jest.mock('expo-asset', () => ({
    Asset: {
        fromModule: jest.fn(() => ({
            downloadAsync: jest.fn(() => Promise.resolve()),
        })),
        fromURI: jest.fn(() => ({
            downloadAsync: jest.fn(() => Promise.resolve()),
        })),
        loadAsync: jest.fn(() => Promise.resolve()),
    },
}));

// Mock expo-font
jest.mock('expo-font', () => ({
    loadAsync: jest.fn(() => Promise.resolve()),
    isLoaded: jest.fn(() => true),
}));

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => {
    const { Text } = require('react-native');
    return {
        Ionicons: Text,
        MaterialIcons: Text,
        AntDesign: Text,
        Entypo: Text,
        FontAwesome: Text,
        FontAwesome5: Text,
        Foundation: Text,
        MaterialCommunityIcons: Text,
        Octicons: Text,
        Zocial: Text,
        SimpleLineIcons: Text,
        Feather: Text,
        EvilIcons: Text,
    };
});

// Mock gesture handler
jest.mock('react-native-gesture-handler', () => {
    const View = require('react-native/Libraries/Components/View/View');
    return {
        Swipeable: View,
        DrawerLayout: View,
        State: {},
        ScrollView: View,
        Slider: View,
        Switch: View,
        TextInput: View,
        ToolbarAndroid: View,
        ViewPagerAndroid: View,
        DrawerLayoutAndroid: View,
        WebView: View,
        NativeViewGestureHandler: View,
        TapGestureHandler: View,
        FlingGestureHandler: View,
        ForceTouchGestureHandler: View,
        LongPressGestureHandler: View,
        PanGestureHandler: View,
        PinchGestureHandler: View,
        RotationGestureHandler: View,
        RawButton: View,
        BaseButton: View,
        RectButton: View,
        BorderlessButton: View,
        FlatList: View,
        gestureHandlerRootHOC: jest.fn(),
        Directions: {},
        GestureHandlerRootView: View,
    };
});

// Mock Reanimated
jest.mock('react-native-reanimated', () => {
    const View = require('react-native').View;
    return {
        default: {
            Value: jest.fn(),
            event: jest.fn(),
            add: jest.fn(),
            eq: jest.fn(),
            set: jest.fn(),
            cond: jest.fn(),
            interpolate: jest.fn(),
            View: View,
            Extrapolate: { CLAMP: jest.fn() },
            Transition: {
                Together: 'Together',
                Out: 'Out',
                In: 'In',
            },
            Easing: {
                in: jest.fn(),
                out: jest.fn(),
                inOut: jest.fn(),
            },
        },
        useSharedValue: jest.fn(() => ({ value: 0 })),
        useAnimatedStyle: jest.fn((cb) => cb()),
        useAnimatedGestureHandler: jest.fn(() => ({})),
        withSpring: jest.fn((value) => value),
        withTiming: jest.fn((value) => value),
        withDecay: jest.fn((value) => value),
        runOnJS: jest.fn((fn) => fn),
        interpolate: jest.fn(),
        Extrapolate: { CLAMP: 'clamp' },
        createAnimatedComponent: (component) => component,
    };
});

// Mock @env
jest.mock('@env', () => ({
    GOOGLE_PLACES_API_KEY: 'mock-api-key',
    GOOGLE_ANDROID_CLIENT_ID: 'mock-android-client-id',
    GOOGLE_IOS_CLIENT_ID: 'mock-ios-client-id',
}));

// Mock expo-constants
jest.mock('expo-constants', () => ({
    expoConfig: {
        extra: {
            GOOGLE_PLACES_API_KEY: 'mock-api-key',
            GOOGLE_ANDROID_CLIENT_ID: 'mock-android-client-id',
            GOOGLE_IOS_CLIENT_ID: 'mock-ios-client-id',
        }
    },
    default: {
        expoConfig: {
            extra: {
                GOOGLE_PLACES_API_KEY: 'mock-api-key',
                GOOGLE_ANDROID_CLIENT_ID: 'mock-android-client-id',
                GOOGLE_IOS_CLIENT_ID: 'mock-ios-client-id',
            }
        }
    }
}));

// Mock Firebase
jest.mock('@react-native-firebase/app', () => ({
    __esModule: true,
    default: jest.fn(() => ({})),
}));

jest.mock('@react-native-firebase/auth', () => {
    const mockAuth = () => ({
        onAuthStateChanged: jest.fn((callback) => {
            callback(null);
            return jest.fn();
        }),
        signInWithCredential: jest.fn(() => Promise.resolve({ user: {} })),
        signOut: jest.fn(() => Promise.resolve()),
    });

    return {
        __esModule: true,
        default: mockAuth,
        GoogleAuthProvider: {
            credential: jest.fn(),
        },
    };
});

jest.mock('@react-native-firebase/firestore', () => ({
    __esModule: true,
    getFirestore: jest.fn(() => ({})),
    collection: jest.fn(),
    getDocs: jest.fn(() => Promise.resolve({
        forEach: jest.fn()
    })),
    doc: jest.fn(),
    setDoc: jest.fn(() => Promise.resolve()),
    deleteDoc: jest.fn(() => Promise.resolve()),
    serverTimestamp: jest.fn(() => new Date()),
    getDoc: jest.fn(() => Promise.resolve({
        exists: () => false,
        data: () => ({})
    })),
}));

// Mock expo-auth-session
jest.mock('expo-auth-session/providers/google', () => ({
    useIdTokenAuthRequest: jest.fn(() => [
        {}, // request
        null, // response
        jest.fn() // promptAsync
    ]),
}));

// Mock expo-location
jest.mock('expo-location', () => ({
    requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
    getCurrentPositionAsync: jest.fn(() => Promise.resolve({
        coords: { latitude: 37.7749, longitude: -122.4194 }
    })),
}));

// Mock Linking
jest.mock('react-native/Libraries/Linking/Linking', () => ({
    openURL: jest.fn(() => Promise.resolve()),
}));