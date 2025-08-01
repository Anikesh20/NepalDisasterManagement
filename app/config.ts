import { Platform } from 'react-native';

let baseUrl = process.env.EXPO_PUBLIC_API_URL;
if (!baseUrl) {
  if (Platform.OS === 'android') {
    baseUrl = 'http://10.0.2.2:3000';
  } else if (Platform.OS === 'ios') {
    baseUrl = 'http://localhost:3000';
  } else {
    baseUrl = 'http://localhost:3000';
  }
}

export const API_CONFIG = {
  development: {
    baseUrl,
  },
  preview: {
    baseUrl,
  },
  production: {
    baseUrl,
  },
};

// Get the current environment
const ENV = (process.env.NODE_ENV || 'development') as keyof typeof API_CONFIG;

// Export the current configuration
export const API_URL = API_CONFIG[ENV]?.baseUrl || baseUrl;

const config = {
  API_CONFIG,
  API_URL,
  ENV
};

export default config;