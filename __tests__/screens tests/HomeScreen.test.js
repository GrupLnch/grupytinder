import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import HomeScreen from 'screens/HomeScreen';
import useAuth from 'hooks/useAuth';
import { useNavigation } from '@react-navigation/native';
import * as placesApi from 'utils/placesApi';

jest.mock('hooks/useAuth', () => ({
    __esModule: true,
    default: jest.fn()
}));

jest.mock('@react-navigation/native', () => ({
    useNavigation: jest.fn()
}));

jest.mock('utils/placesApi', () => ({
    fetchNearbyRestaurants: jest.fn()
}));

describe('HomeScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useAuth.mockReturnValue({
            user: { photoURL: 'https://example.com/avatar.png' },
            signOut: jest.fn(),
        });
        useNavigation.mockReturnValue({ navigate: jest.fn() });

        placesApi.fetchNearbyRestaurants.mockResolvedValue([
            {
                id: '1',
                name: 'Test Place',
                imageUrl: 'https://via.placeholder.com/150',
                description: 'Test description',
            }
        ]);
    });

    it('fetches and displays restaurants', async () => {
        render(<HomeScreen />);

        await waitFor(() => {
            expect(screen.getByText('Test Place')).toBeTruthy();
        });

        expect(placesApi.fetchNearbyRestaurants).toHaveBeenCalledTimes(1);
    });
});
