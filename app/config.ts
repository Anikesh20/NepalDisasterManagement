export const API_CONFIG = {
  development: {
    baseUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
  },
  preview: {
    baseUrl: process.env.EXPO_PUBLIC_API_URL || 'https://nepaldisastermanagement-preview.up.railway.app',
  },
  production: {
<<<<<<< HEAD
    baseUrl: process.env.EXPO_PUBLIC_API_URL || 'https://nepaldisastermanagement-production.up.railway.app',
=======
    baseUrl: 'https://nepaldisastermanagement-production.up.railway.app',
>>>>>>> 19a0bbb3b476ee1d5a05fb6e2360ed67e8cde768
  },
};

// Get the current environment
const ENV = process.env.NODE_ENV || 'development';

// Export the current configuration
export const API_URL = API_CONFIG[ENV].baseUrl;

// Add a default export to satisfy expo-router
const config = {
  API_CONFIG,
  API_URL,
  ENV
};

export default config;