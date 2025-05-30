// API Keys and configuration
export const API_CONFIG = {
  // Backend API URL
  API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000',

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