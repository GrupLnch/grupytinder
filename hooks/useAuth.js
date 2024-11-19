import React, { createContext, useContext, useEffect, useState } from "react";
import { useIdTokenAuthRequest } from "expo-auth-session/providers/google";
import { GoogleAuthProvider, signInWithCredential } from "@firebase/auth";
import auth from "../firebase";
import {Platform} from "react-native"; // Firebase instance

const AuthContext = createContext({
    user: null,
    signInWithGoogle: () => {},
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // Configuration for Google Authentication
    const config = {
        androidClientId: '316379143309-ddl0rsv98mvf7j1ar9o3sf308974sc0d.apps.googleusercontent.com',
        iosClientId: '316379143309-avd51fk0necojuel6foc60clcor6fvck.apps.googleusercontent.com',
        scopes: ["profile", "email"],
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
            const credential = GoogleAuthProvider.credential(id_token);
            signInWithCredential(auth, credential)
                .then((userCredential) => {
                    setUser(userCredential.user);
                    console.log("User logged in:", userCredential.user);
                })
                .catch((error) => {
                    console.error("Firebase credential error:", error);
                });
        }
    }, [response]);

    // Google Sign-In trigger
    const signInWithGoogle = async () => {
        try {
            await promptAsync();
        } catch (error) {
            console.error("Sign-in error:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, signInWithGoogle }}>
            {children}
        </AuthContext.Provider>
    );
};

export default function useAuth() {
    return useContext(AuthContext);
}
