import React from 'react';
import { render } from '@testing-library/react-native';
import HomeScreen from 'screens/HomeScreen';
import useAuth from 'hooks/useAuth';
import { useNavigation } from '@react-navigation/native';

jest.mock('hooks/useAuth');
jest.mock('@react-navigation/native');
jest.mock('utils/placesApi', () => ({
    fetchNearbyRestaurants: jest.fn(() => Promise.resolve([]))
}));

describe('HomeScreen', () => {
    beforeEach(() => {
        useAuth.mockReturnValue({
            user: {
                uid: 'test-uid',
                photoURL: 'https://example.com/avatar.png'
            },
            signOut: jest.fn(),
        });

        useNavigation.mockReturnValue({
            navigate: jest.fn()
        });
    });

    it('renders without crashing', () => {
        const { getByTestId } = render(<HomeScreen />);
        expect(getByTestId('home-screen-view')).toBeTruthy();
    });
});