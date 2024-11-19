// Import the functions you need from the SDKs
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCOu-a77pcmlXwnKBgEm7SdJpqlpAeeLbA",
    authDomain: "grupytinder.firebaseapp.com",
    projectId: "grupytinder",
    storageBucket: "grupytinder.appspot.com",
    messagingSenderId: "316379143309",
    appId: "1:316379143309:web:6ff0cbf208f56a96edd6c4",
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with AsyncStorage for persistence
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export default auth;
