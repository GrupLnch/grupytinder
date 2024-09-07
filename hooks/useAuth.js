import React, {createContext, useContext} from "react";
import { View, Text } from "react-native";

const AuthContext = createContext({
    // Initial state context
})

export const AuthProvider = ({ children }) => {
    return (
        <AuthContext.Provider value={{
            user: "Calvin",
        }}>
            { children }
        </AuthContext.Provider>
    );
};

export default function useAuth() {
    return useContext(AuthContext);
}