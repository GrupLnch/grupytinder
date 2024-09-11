import React, {createContext, useContext, useEffect} from "react";
import {useIdTokenAuthRequest} from "expo-auth-session/providers/google";

const AuthContext = createContext({});

const config = {
    androidClientId: '316379143309-au5c79ocs75s1e48tcpvqghit0erp42h.apps.googleusercontent.com',
    iosClientId: '316379143309-060fa2q928k8af5c8jh57d95da4s3e26.apps.googleusercontent.com',
    scopes: ["profile", "email"],
    permissions: ["public_profile", "email", "gender", "location"],
}

export const AuthProvider = ({ children }) => {
    const [request, response, promptAsync] = useIdTokenAuthRequest({
        clientId: config.androidClientId,
    });

    useEffect(() => {
        if (response?.type === 'success') {
            const { id_token } = response.params;
            // Handle successful login (e.g., save id_token or authenticate with Firebase)
            console.log("Google login success: ", id_token);
        }
    }, [response]);

    const signInWithGoogle = async () => {
        try {
            await promptAsync();
        } catch (error) {
            console.error("Sign-in error: ", error);
        }
    };


    return (
        <AuthContext.Provider value={{
            user: null,
            signInWithGoogle
        }}>
            { children }
        </AuthContext.Provider>
    );
};

export default function useAuth() {
    return useContext(AuthContext);
}