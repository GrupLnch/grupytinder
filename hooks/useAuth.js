import React, {createContext, useContext, useEffect, useMemo, useState} from "react";
import {useIdTokenAuthRequest} from "expo-auth-session/providers/google";
import {GoogleAuthProvider, onAuthStateChanged, signInWithCredential, signOut as firebaseSignOut} from "@firebase/auth";
import auth from "../firebase";
import {Platform} from "react-native";

const AuthContext = createContext({
    user: null,
    loading: false,
    signInWithGoogle: () => {},
    signOut: () => {},
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Start as `true` to block UI until session is determined

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
            setLoading(false); // Stop loading once session is determined
        }); // Cleanup listener on component unmount
    }, []);

    // Handle Google sign-in response
    useEffect(() => {
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
        }
    }, [response]);

    // Google Sign-In trigger
    const signInWithGoogle = async () => {
        try {
            setLoading(true);
            console.log("Prompting user for Google sign-in...");
            await promptAsync();
        } catch (error) {
            console.error("Sign-in error:", error);
        }
    };

    // Sign-out function
    const signOut = async () => {
        if (!user) return; // Prevent unnecessary sign-out calls

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
