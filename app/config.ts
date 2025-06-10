export const API_CONFIG = {
  development: {
    baseUrl: 'http://localhost:3000',
  },
  production: {
    baseUrl: 'https://nepaldisastermanagement-production.up.railway.app',
  },
};

// Get the current environment
const ENV = process.env.NODE_ENV || 'development';

// Export the current configuration
export const API_URL = API_CONFIG[ENV].baseUrl;

// Add a default export to satisfy expo-router
const config = {
  API_CONFIG,
  API_URL
};

export default config;