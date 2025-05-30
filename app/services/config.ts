// Update this URL to match your actual backend server
export const API_URL = 'http://10.0.2.2:3000/api'; // For Android emulator
// export const API_URL = 'http://localhost:3000/api'; // For iOS simulator
// export const API_URL = 'http://YOUR_ACTUAL_IP:3000/api'; // For physical device

// Add a default export to satisfy expo-router
const config = {
  API_URL,
  // Add other config values here
  STRIPE_PUBLISHABLE_KEY: 'pk_test_51RH1RtLnm2eBVvTqnVeoBJepGyBj8cS0kFdlFgzwwcT66NRtDpyywesUqWZv08tfQQw3KlWPnqvrtBeq89ok5jXy00kkZ0iHlS'
};

export default config;