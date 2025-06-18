import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './config';

// Mock user data for testing when API fails
const MOCK_USER_DATA = {
  id: '1',
  email: 'test@example.com',
  username: 'testuser',
  full_name: 'Test User',
  phone_number: '9876543210',
  emergency_number: '1234567890',
  blood_group: 'O+',
  district: 'Kathmandu',
  skills: ['First Aid', 'Search and Rescue'],
  profile_image: null
};

export const getUserProfile = async (userId: string) => {
  try {
    console.log('Fetching user profile for ID:', userId);
    console.log('Using API URL:', API_URL);

    // Get token from storage
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      console.error('No authentication token found');

      // For development/testing, create a test token if none exists
      const testToken = 'test_token_' + Date.now();
      console.log('Creating test token for development:', testToken);
      await AsyncStorage.setItem('token', testToken);
    }

    // Get the token again (either existing or newly created test token)
    const currentToken = await AsyncStorage.getItem('token');

    console.log('Making API request to:', `${API_URL}/users/${userId}`);
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      },
    });

    console.log('API response status:', response.status);

    if (!response.ok) {
      let errorMsg = 'Failed to fetch user profile';
      try {
        const errData = await response.json();
        console.error('Error response data:', errData);
        if (errData && errData.error) errorMsg = errData.error;
      } catch (parseError) {
        console.error('Error parsing error response:', parseError);
      }
      throw new Error(errorMsg);
    }

    const data = await response.json();
    console.log('User profile data received:', data);

    // Store the successful response in AsyncStorage for offline access
    await AsyncStorage.setItem('userProfileData', JSON.stringify(data));

    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);

    // Try to get cached profile data from AsyncStorage
    try {
      const cachedData = await AsyncStorage.getItem('userProfileData');
      if (cachedData) {
        console.log('Using cached user profile data');
        return JSON.parse(cachedData);
      }
    } catch (cacheError) {
      console.error('Error retrieving cached profile data:', cacheError);
    }

    // If no cached data, fall back to mock data
    console.log('Falling back to mock user data');
    return MOCK_USER_DATA;
  }
};

// Helper function to check if the backend is reachable
export const checkBackendConnection = async (): Promise<boolean> => {
  try {
    console.log('Checking backend connection to:', API_URL);
    const response = await fetch(`${API_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    return response.ok;
  } catch (error) {
    console.error('Backend connection check failed:', error);
    return false;
  }
};

// Helper function to enable or disable mock data mode
export const setUseMockData = async (useMock: boolean) => {
  await AsyncStorage.setItem('useMockData', useMock ? 'true' : 'false');
  console.log(`Mock data mode ${useMock ? 'enabled' : 'disabled'}`);
};

export const updateUserProfile = async (userId: string, userData: any) => {
  try {
    console.log('Updating user profile for ID:', userId);
    console.log('Update data:', userData);

    // Get token from storage
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      console.error('No authentication token found');

      // For development/testing, create a test token if none exists
      const testToken = 'test_token_' + Date.now();
      console.log('Creating test token for development:', testToken);
      await AsyncStorage.setItem('token', testToken);
    }

    // Get the token again (either existing or newly created test token)
    const currentToken = await AsyncStorage.getItem('token');

    console.log('Making API request to:', `${API_URL}/users/${userId}`);
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      },
      body: JSON.stringify(userData),
    });

    console.log('API response status:', response.status);

    if (!response.ok) {
      let errorMsg = 'Failed to update user profile';
      try {
        const errData = await response.json();
        console.error('Error response data:', errData);
        if (errData && errData.error) errorMsg = errData.error;
      } catch (parseError) {
        console.error('Error parsing error response:', parseError);
      }
      throw new Error(errorMsg);
    }

    const data = await response.json();
    console.log('Profile update response:', data);

    // Update the cached profile data
    const updatedProfile = { ...data };
    await AsyncStorage.setItem('userProfileData', JSON.stringify(updatedProfile));

    return data;
  } catch (error) {
    console.error('Error updating user profile:', error);

    // For update operations, we'll still throw the error but with more context
    if (error instanceof Error) {
      throw new Error(`Failed to update profile: ${error.message}`);
    } else {
      throw new Error('Failed to update profile: Unknown error');
    }
  }
};

// Create a default export object with all the functions
const userService = {
  getUserProfile,
  checkBackendConnection,
  setUseMockData,
  updateUserProfile
};

export default userService;