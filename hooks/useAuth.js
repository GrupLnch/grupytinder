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
export default function useAuth() {
    return useContext(AuthContext);
}
