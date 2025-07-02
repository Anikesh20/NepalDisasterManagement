export const API_CONFIG = {
  development: {
    baseUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
  },
  preview: {
    baseUrl: process.env.EXPO_PUBLIC_API_URL || 'https://nepaldisastermanagement-preview.up.railway.app',
  },
  production: {
    baseUrl: process.env.EXPO_PUBLIC_API_URL || 'https://nepaldisastermanagement-production.up.railway.app',
  },
};

// Get the current environment
const ENV = (process.env.NODE_ENV || 'development') as keyof typeof API_CONFIG;

// Export the current configuration
export const API_URL = API_CONFIG[ENV]?.baseUrl || API_CONFIG.development.baseUrl;

// Add a default export to satisfy expo-router
const config = {
  API_CONFIG,
  API_URL,
  ENV
};

export default config;