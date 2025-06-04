
import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence, getAuth } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from 'firebase/firestore';

// Web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCOu-a77pcmlXwnKBgEm7SdJpqlpAeeLbA",
    authDomain: "grupytinder.firebaseapp.com",
    projectId: "grupytinder",
    storageBucket: "grupytinder.appspot.com",
    messagingSenderId: "316379143309",
    appId: "1:316379143309:web:6ff0cbf208f56a96edd6c4",
};

// Initialize Firebase app
// Check if a Firebase app instance already exists to avoid re-initializing
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth with AsyncStorage for persistence
// Use getAuth to retrieve the auth instance if the app was already initialized
const auth = getAuth(app) || initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});


// Get Firestore instance
const db = getFirestore(app);

// Export the services
export {
    app,
    auth,
    db,
};
