export const API_CONFIG = {
  development: {
    baseUrl: 'http://localhost:3000',
  },
  production: {
    // Replace this with your actual deployed server URL
    baseUrl: 'https://your-backend-domain.com',
  },
};

// Get the current environment
const ENV = process.env.NODE_ENV || 'development';

// Export the current configuration
export const API_URL = API_CONFIG[ENV].baseUrl; 