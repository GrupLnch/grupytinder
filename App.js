import React from 'react';
import StackNavigator from './StackNavigator';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './hooks/useAuth';

const App = () => {
    return (
        <AuthProvider>
            <NavigationContainer>
                <StackNavigator />
            </NavigationContainer>
        </AuthProvider>
    );
};

export default App;
