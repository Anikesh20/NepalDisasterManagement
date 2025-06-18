import { Platform } from 'react-native';

// Helper function to get the local IP address
const getLocalIP = () => {
  // This should only be used as a fallback for development on physical devices
  // You can replace this with your actual local IP address if needed for specific setups
  return '192.168.1.100'; // Replace with your computer's local IP address if not using emulator
};

// Determine the base URL based on environment variables or development defaults
const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  } else if (__DEV__) {
    // Fallback for development if EXPO_PUBLIC_API_URL is not set (e.g., expo start)
    if (Platform.OS === 'android') {
      // Android emulator points to 10.0.2.2 for host machine localhost
      return 'http://10.0.2.2:3000';
    } else if (Platform.OS === 'ios') {
      // iOS simulator points to localhost
      return 'http://localhost:3000';
    } else {
      // Physical device in development (requires local IP)
      return `http://${getLocalIP()}:3000`;
    }
  } else {
    // Fallback for production if EXPO_PUBLIC_API_URL is not set (should not happen with EAS)
    return 'https://nepaldisastermanagement-production.up.railway.app';
  }
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