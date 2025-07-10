import { Platform } from 'react-native';

// Default to localhost for web/iOS simulator
let API_BASE_URL = 'http://localhost:3000';

if (Platform.OS === 'android') {
  // If running on Android emulator, use 10.0.2.2
  API_BASE_URL = 'http://10.0.2.2:3000';
}

// Optionally, allow override for physical device via env or manual config
// e.g., set REACT_NATIVE_API_HOST in .env or hardcode your local IP
if (process.env.REACT_NATIVE_API_HOST) {
  API_BASE_URL = process.env.REACT_NATIVE_API_HOST;
}

export { API_BASE_URL };

// API Keys and configuration
export const API_CONFIG = {
  // Backend API URL
  API_BASE_URL: API_BASE_URL,

  // SendGrid configuration (for backend use)
  SENDGRID_API_KEY: process.env.EXPO_PUBLIC_SENDGRID_API_KEY || '',
  SENDGRID_FROM_EMAIL: process.env.EXPO_PUBLIC_SENDGRID_FROM_EMAIL || 'donations@nepaldisastermanagement.org',
  SENDGRID_FROM_NAME: 'Nepal Disaster Management',

  // Twilio configuration (for backend use)
  TWILIO_ACCOUNT_SID: process.env.EXPO_PUBLIC_TWILIO_ACCOUNT_SID || '',
  TWILIO_AUTH_TOKEN: process.env.EXPO_PUBLIC_TWILIO_AUTH_TOKEN || '',
  TWILIO_PHONE_NUMBER: process.env.EXPO_PUBLIC_TWILIO_PHONE_NUMBER || '',

  // Other configuration
  APP_NAME: 'Nepal Disaster Management',
  SUPPORT_EMAIL: 'support@nepaldisastermanagement.org',
  SUPPORT_PHONE: '+977-XXXXXXXXXX',
}; 