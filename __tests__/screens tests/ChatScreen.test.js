import React from 'react';
import { render, screen } from '@testing-library/react-native';
//import { View, Text } from 'react-native';
import ChatScreen from 'screens/ChatScreen';

describe('ChatScreen', () => {
    it('renders the ChatScreen component', () => {
        render(<ChatScreen />);
        expect(screen.getByText('I am the ChatScreen')).toBeTruthy();
    });

    it('renders a View component using testID', () => {
        render(<ChatScreen />);
        expect(screen.getByTestId('chat-screen-view')).toBeTruthy();
    });

    // Ensure accessibility features are tested correctly
    it('displays the correct message for screen readers', () => {
        render(<ChatScreen />);
        expect(screen.getByText('I am the ChatScreen')).toBeTruthy();
    });
});
