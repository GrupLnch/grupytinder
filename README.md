# Grup Lnch (Grup Lunch)

A Tinder-style food discovery app that helps users find the perfect meal by swiping through restaurant options. Built with React Native and Expo.

---

## Quick Start Guide

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **Android Studio** (for Android emulator) - [Download here](https://developer.android.com/studio)

---

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/calvin1011/grupytinder.git
cd grupytinder
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:
```env
GOOGLE_PLACES_API_KEY=your_google_places_api_key
GOOGLE_ANDROID_CLIENT_ID=your_android_client_id
GOOGLE_IOS_CLIENT_ID=your_ios_client_id
```

**To get your API keys:**
- **Google Places API:** [Google Cloud Console](https://console.cloud.google.com/)
- **Google OAuth:** [Firebase Console](https://console.firebase.google.com/)

### 4. Add Firebase Configuration Files

- **iOS:** Place `GoogleService-Info.plist` in the project root
- **Android:** Place `google-services.json` in the project root

---

## Setting Up Android Emulator

### Step 1: Install Android Studio

1. Download and install [Android Studio](https://developer.android.com/studio)
2. During installation, ensure these components are selected:
   - Android SDK
   - Android SDK Platform
   - Android Virtual Device (AVD)

### Step 2: Configure Android SDK

1. Open Android Studio
2. Go to **Settings** → **Appearance & Behavior** → **System Settings** → **Android SDK**
3. Install the following:
   - Android 13.0 (Tiramisu) - API Level 33
   - Android SDK Build-Tools
   - Android Emulator
   - Android SDK Platform-Tools

### Step 3: Set Environment Variables

Add these to your system environment variables:

**macOS/Linux** (add to `~/.bash_profile` or `~/.zshrc`):
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

**Windows** (add to System Environment Variables):
```
ANDROID_HOME=C:\Users\YourUsername\AppData\Local\Android\Sdk
```

Then restart your terminal.

### Step 4: Create an Android Virtual Device (AVD)

1. Open Android Studio
2. Click **More Actions** → **Virtual Device Manager**
3. Click **Create Device**
4. Select a device (recommended: **Pixel 5**)
5. Select a system image (recommended: **API 33 - Android 13.0**)
6. Click **Finish**

---

## Running the App

### Start the Development Server
```bash
npx expo start
```

### Launch on Android Emulator

**Option 1: From Expo CLI**
```bash
# Start expo
npx expo start

# Press 'a' in the terminal to open Android emulator
```

**Option 2: Direct Command**
```bash
npx expo run:android
```

The app will automatically build and install on your emulator.

### Launch on Physical Android Device

1. Enable **Developer Options** on your Android device
2. Enable **USB Debugging**
3. Connect your device via USB
4. Run `npx expo start` and press `a`

---

## Testing

### Run All Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

### Run Linting
```bash
npm run lint
```

---

## Key Features

- ** Google Authentication:** Secure Firebase-based login
- ** Restaurant Discovery:** Swipe through nearby restaurants
- ** Smart Filters:** Filter by cuisine, price, rating, dietary needs
- ** Favorites Management:** Save and organize liked restaurants
- ** Progress Tracking:** View your discovery stats and history
- ** User Profiles:** Customize your food preferences
- ** Directions:** Quick access to Google Maps navigation

---

## ️ Project Structure
```
grupytinder/
├── screens/              # Main application screens
│   ├── HomeScreen.js     # Swipeable restaurant cards
│   ├── LoginScreen.js    # Google authentication
│   ├── FavoritesScreen.js # Saved restaurants
│   └── ProfileScreen.js  # User profile management
├── hooks/                # Custom React hooks
│   └── useAuth.js        # Authentication logic
├── utils/                # Utility functions
│   └── placesApi.js      # Google Places API integration
├── __tests__/            # Jest test files
├── App.js               # Root component
├── StackNavigator.js    # Navigation configuration
└── firebase config files # Firebase credentials
```

---

## Firebase Collections Structure
```
users/
  {userId}/
    - displayName
    - email
    - photoURL
    - bio
    - foodInterests
    - favoriteCuisines
    - dietaryRestrictions
    
    likedRestaurants/
      {placeId}/
        - name
        - rating
        - photos
        - geometry
        - savedAt
    
    seenRestaurants/
      {placeId}/
        - name
        - action (liked/passed)
        - timestamp
    
    stats/
      summary/
        - totalSeen
        - totalLiked
        - streak
        - lastActive
```

---

## Tech Stack

- **Framework:** React Native with Expo SDK 52
- **Language:** JavaScript (JSX)
- **Navigation:** React Navigation
- **State Management:** React Hooks (useState, useEffect, useContext)
- **Styling:** NativeWind (Tailwind CSS for React Native)
- **Animations:** React Native Reanimated + Gesture Handler
- **Backend:** Firebase (Authentication, Firestore)
- **APIs:** Google Places API, Google Maps API
- **Testing:** Jest + React Testing Library

---

## Troubleshooting

### Issue: "Metro bundler not starting"
```bash
# Clear cache and restart
npx expo start -c
```

### Issue: "Android emulator not launching"
```bash
# Check if emulator is available
emulator -list-avds

# Launch specific emulator
emulator -avd Pixel_5_API_33
```

### Issue: "Google Places API not working"
- Verify your API key in `.env` file
- Enable Places API in Google Cloud Console
- Check API key restrictions (should allow Android apps)

### Issue: "Firebase authentication failing"
- Ensure `google-services.json` and `GoogleService-Info.plist` are in root directory
- Verify SHA-1 fingerprint is added in Firebase Console
- Check OAuth client IDs match your `.env` file

---

## Building for Production

### Android APK
```bash
eas build --platform android --profile preview
```

### iOS IPA
```bash
eas build --platform ios --profile preview
```

**Note:** Requires EAS CLI and Expo account. See [EAS Build docs](https://docs.expo.dev/build/introduction/).

---

## 👥 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Support

For issues or questions:
- Open an issue on GitHub
- Check existing documentation
- Review Firebase and Expo documentation

---

## Roadmap

-  Food delivery integration (DoorDash, Uber Eats)
-  Social features (share favorites with friends)
-  Advanced filtering with AI recommendations
-  Points and rewards system
-  Restaurant reservation integration
-  Dark mode support

---

**Made with ❤️ for food lovers everywhere**