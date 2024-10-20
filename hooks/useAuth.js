import React, {createContext, useContext, useEffect, useState} from "react";
import {View, Text, Platform} from "react-native";
import { useIdTokenAuthRequest } from "expo-auth-session/providers/google";
import { makeRedirectUri } from "expo-auth-session";
import { signInWithCredential } from "@react-native-firebase/auth"; // Use @react-native-firebase/auth
import { GoogleAuthProvider } from "@react-native-firebase/auth";
import auth from "../firebase";

const AuthContext = createContext({
    // Initial state context
})

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const config = {
        androidClientId: '316379143309-ddl0rsv98mvf7j1ar9o3sf308974sc0d.apps.googleusercontent.com',
        iosClientId: '316379143309-avd51fk0necojuel6foc60clcor6fvck.apps.googleusercontent.com',
        expoClientId: '316379143309-pr1eqn6163c18eoo8u56jm5v7dnk8j0t.apps.googleusercontent.com',
        scopes: ["profile", "email"],
    };

    const [request, response, promptAsync] = useIdTokenAuthRequest({
        clientId: config.expoClientId || (Platform.OS === 'android' ? config.androidClientId : config.iosClientId),
        scopes: config.scopes,
        redirectUri: makeRedirectUri({
            scheme: "com.ssendawulac.grupytinder",
            useProxy: false,
        }),
    });

    useEffect(() => {
        if (response?.type === "success") {
            const {id_token} = response.params;
            const credential = GoogleAuthProvider.credential(id_token);
            signInWithCredential(auth, credential)
                .then((userCredential) => {
                    setUser(userCredential.user);
                })
                .catch((error) => {
                    console.error("Firebase credential error:", error);
                });
        }
    }, [response]);

    const signInWithGoogle = async () => {
        try {
            await promptAsync();
        } catch (error) {
            console.error("Sign-in error:", error);
        }
    };

    return (
        <AuthContext.Provider value={{user, signInWithGoogle}}>
            {children}
        </AuthContext.Provider>
    );
};

export default function useAuth() {
    return useContext(AuthContext);
}