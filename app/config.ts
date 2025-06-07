export const API_CONFIG = {
  development: {
    baseUrl: 'http://localhost:3000',
  },
  production: {
    // Replace with your Railway.app domain after deployment
    baseUrl: 'https://nepal-disaster-management-backend.railway.app',
  },
};

// Get the current environment
const ENV = __DEV__ ? 'development' : 'production';

// Export the current configuration
export const API_URL = API_CONFIG[ENV].baseUrl;

// Add a default export to satisfy expo-router
const config = {
  API_CONFIG,
  API_URL
};

export default config;