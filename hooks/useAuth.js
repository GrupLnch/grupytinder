import React, {createContext, useContext, useEffect, useMemo, useState} from "react";
import {useIdTokenAuthRequest} from "expo-auth-session/providers/google";
import {GoogleAuthProvider, onAuthStateChanged, signInWithCredential, signOut as firebaseSignOut} from "@firebase/auth";
import { auth } from "../firebase";
import {Platform} from "react-native";
import { GOOGLE_ANDROID_CLIENT_ID, GOOGLE_IOS_CLIENT_ID } from '@env';

const AuthContext = createContext({
    user: null,
    loading: false,
    signInWithGoogle: () => {},
    signOut: () => {},
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Configuration for Google Authentication
    const config = {
        androidClientId: GOOGLE_ANDROID_CLIENT_ID,
        iosClientId: GOOGLE_IOS_CLIENT_ID,
        scopes: ["profile", "email"],
        permissions: ["public_profile", "email", "gender", "location"],
    };

    // Initialize Google Sign-In request
    const [request, response, promptAsync] = useIdTokenAuthRequest({
        clientId: Platform.OS === "android" ? config.androidClientId : config.iosClientId,
        scopes: config.scopes,
    });

    // Listen for authentication state changes
    useEffect(() => {
        return onAuthStateChanged(auth, (authUser) => {
            if (authUser) {
                // User is signed in
                setUser(authUser);
                console.log("Session restored:", authUser);
            } else {
                // User is signed out
                setUser(null);
                console.log("No active session, user is logged out.");
            }
            setLoading(false);
        });
    }, []);

    // Handle Google sign-in response
    useEffect(() => {
        console.log("Google Sign-In response:", response);
        if (response?.type === "success") {
            const { id_token } = response.params;
            console.log("Google Sign-In response received, attempting to authenticate with Firebase...");

            const credential = GoogleAuthProvider.credential(id_token);
            setLoading(true);
            signInWithCredential(auth, credential)
                .then((userCredential) => {
                    setUser(userCredential.user);
                    console.log("User logged in:", userCredential.user);
                })
                .catch((error) => {
                    console.error("Firebase credential error:", error);
                })
                .finally(() => setLoading(false));
        } else {
            console.log("Google Sign-In failed or canceled.");
        }
    }, [response]);

    // Google Sign-In trigger
    const signInWithGoogle = async () => {
        try {
            console.log("Login button pressed");
            console.log("Google Auth Request:", request);
            setLoading(true);
            const result = await promptAsync();
            console.log("promptAsync result:", result);
        } catch (error) {
            console.error("Sign-in error:", error);
        } finally {
            setLoading(false);
        }
    };

    // Sign-out function
    const signOut = async () => {
        if (!user) return;

        try {
            console.log("Signing out...");
            await firebaseSignOut(auth);
            setUser(null);
            console.log("User signed out successfully");
        } catch (error) {
            console.error("Error signing out", error);
        }
    };

    const memoizedUser = useMemo(() => user, [user]);

    return (
        <AuthContext.Provider value={{ user: memoizedUser, loading, signInWithGoogle, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export default function useAuth() {
    return useContext(AuthContext);
}