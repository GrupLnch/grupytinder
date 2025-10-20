import React from 'react';
import StackNavigator from './StackNavigator';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from "./hooks/useAuth";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import "./global.css";

export default function App() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <NavigationContainer>
                {/* HOC- Higher Order Component */}
                <AuthProvider>
                    {/* Passes down the cool auth stuff to children...*/}
                    <StackNavigator />
                </AuthProvider>
            </ NavigationContainer>
        </GestureHandlerRootView>
    );
}