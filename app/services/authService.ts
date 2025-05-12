import AsyncStorage from '@react-native-async-storage/async-storage';

// Update this URL to match your actual backend server
const API_URL = 'http://10.0.2.2:3000/api/auth'; // For Android emulator
// const API_URL = 'http://localhost:3000/api/auth'; // For iOS simulator
// const API_URL = 'http://YOUR_ACTUAL_IP:3000/api/auth'; // For physical device

export const signup = async (userData: any) => {
  try {
    // Transform the data to match backend expectations
    const formattedData = {
      email: userData.email,
      username: userData.username,
      full_name: userData.full_name || userData.fullName,
      phone_number: userData.phone_number || userData.phoneNumber,
      emergency_number: userData.emergency_number || userData.emergencyNumber || null,
      district: userData.district,
      current_location: userData.current_location || userData.currentLocation,
      blood_group: userData.blood_group || userData.bloodGroup || null,
      password: userData.password,
      is_volunteer: userData.is_volunteer || userData.isVolunteer || false
    };

    console.log('Attempting signup with:', API_URL);
    console.log('User data:', { ...formattedData, password: '***' });

    const response = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(formattedData),
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);

    if (!response.ok) {
      if (data.error === 'User already exists') {
        throw new Error('An account with this email already exists');
      } else if (data.error === 'Missing required fields') {
        throw new Error('Please fill in all required fields');
      } else if (data.details) {
        throw new Error(data.details);
      } else {
        throw new Error(data.error || 'Signup failed. Please try again.');
      }
    }

    return data;
  } catch (error: any) {
    console.error('Signup error:', error);
    if (error.message === 'Network request failed') {
      throw new Error('Cannot connect to server. Please check your internet connection and try again.');
    }
    throw error;
  }
};

export const login = async (email: string, password: string) => {
  try {
    // Hardcoded credentials for testing
    if (email === 'test@gmail.com' && password === '000000') {
      const mockUserData = {
        user: {
          id: 1,
          email: 'test@gmail.com',
          username: 'testuser',
          full_name: 'Test User'
        },
        token: 'mock_token_for_testing',
        message: 'Login successful'
      };

      // Store user ID and token in AsyncStorage
      await AsyncStorage.setItem('userId', String(mockUserData.user.id));
      await AsyncStorage.setItem('token', mockUserData.token);

      return mockUserData;
    }

    console.log('Attempting login with:', API_URL);
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);

    if (!response.ok) {
      if (data.error === 'Invalid credentials') {
        throw new Error('Invalid email or password');
      } else if (data.details) {
        throw new Error(data.details);
      } else {
        throw new Error(data.error || 'Login failed. Please try again.');
      }
    }

    // Store user ID and token in AsyncStorage
    await AsyncStorage.setItem('userId', String(data.user.id));
    await AsyncStorage.setItem('token', data.token);

    return data;
  } catch (error: any) {
    console.error('Login error:', error);
    if (error.message === 'Network request failed') {
      throw new Error('Cannot connect to server. Please check your internet connection and try again.');
    }
    throw error;
  }
};

export const logout = async () => {
  try {
    await AsyncStorage.removeItem('userId');
    await AsyncStorage.removeItem('token');
  } catch (error) {
    console.error('Error during logout:', error);
    throw error;
  }
};

const authService = {
  signup,
};

export default authService; 