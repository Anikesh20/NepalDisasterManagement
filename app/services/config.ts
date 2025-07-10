import { Platform } from 'react-native';

// Helper function to get the local IP address
const getLocalIP = () => {
  // This should only be used as a fallback for development on physical devices
  // You can replace this with your actual local IP address if needed for specific setups
  return '192.168.1.100'; // Replace with your computer's local IP address if not using emulator
};

// Determine the base URL based on environment variables or development defaults
const getBaseUrl = () => {
  // If running in development (emulator/simulator)
  if (__DEV__) {
    if (Platform.OS === 'android') {
      // Android emulator: 10.0.2.2 points to host machine
      return 'http://10.0.2.2:3000';
    } else if (Platform.OS === 'ios') {
      // iOS simulator: localhost points to host machine
      return 'http://localhost:3000';
    }
  }
  // In production (APK build), use Render backend
  return 'https://nepaldisastermanagement.onrender.com';
};

// API configuration
export const API_URL = `${getBaseUrl()}/api`;

// Add a default export to satisfy expo-router
const config = {
  API_URL,
  // Add other config values here
  STRIPE_PUBLISHABLE_KEY: 'pk_test_51RH1RtLnm2eBVvTqnVeoBJepGyBj8cS0kFdlFgzwwcT66NRtDpyywesUqWZv08tfQQw3KlWPnqvrtBeq89ok5jXy00kkZ0iHlS'
};

export default config;