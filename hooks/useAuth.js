import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { useIdTokenAuthRequest } from "expo-auth-session/providers/google";
import { GoogleAuthProvider, signInWithCredential, signOut as firebaseSignOut } from "@firebase/auth";
import auth from "../firebase";
import { Platform } from "react-native";

const AuthContext = createContext({
    user: null,
    loading: false,
    signInWithGoogle: () => {},
    signOut: () => {},
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false); // Added loading state

    // Configuration for Google Authentication
    const config = {
        androidClientId: '316379143309-ddl0rsv98mvf7j1ar9o3sf308974sc0d.apps.googleusercontent.com',
        iosClientId: '316379143309-avd51fk0necojuel6foc60clcor6fvck.apps.googleusercontent.com',
        scopes: ["profile", "email"],
        permissions: ["public_profile", "email", "gender", "location"],
    };

    // Initialize Google Sign-In request
    const [request, response, promptAsync] = useIdTokenAuthRequest({
        clientId: Platform.OS === "android" ? config.androidClientId : config.iosClientId,
        scopes: config.scopes,
    });

    useEffect(() => {
        // Handle the sign-in response when successful
        if (response?.type === "success") {
            const { id_token } = response.params;
            console.log("Google Sign-In response received, attempting to authenticate with Firebase...");

            const credential = GoogleAuthProvider.credential(id_token);
            setLoading(true); // Set loading to true before attempting Firebase authentication
            signInWithCredential(auth, credential)
                .then((userCredential) => {
                    setUser(userCredential.user);
                    console.log("User logged in:", userCredential.user);
                })
                .catch((error) => {
                    console.error("Firebase credential error:", error);
                })
                .finally(() => {
                    setLoading(false); // Reset loading when authentication completes
                });
        }
    }, [response]);

    // Google Sign-In trigger
    const signInWithGoogle = async () => {
        try {
            setLoading(true); // Set loading to true when the user presses the login button
            console.log("Prompting user for Google sign-in...");
            await promptAsync();
        } catch (error) {
            console.error("Sign-in error:", error);
        }
    };

    const signOut = async () => {
        if (!user) return; // Prevent sign-out if no user is logged in

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
