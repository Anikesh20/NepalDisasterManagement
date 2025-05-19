import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys for storing auth state
const AUTH_TOKEN_KEY = 'authToken';
const USER_ID_KEY = 'userId';
const IS_ADMIN_KEY = 'isAdmin';
const ADMIN_TOKEN_KEY = 'adminToken';

/**
 * Save user authentication state
 * @param userId User ID
 * @param token Authentication token
 */
export const saveUserAuthState = async (userId: string, token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(USER_ID_KEY, userId);
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    // Ensure admin state is cleared when logging in as regular user
    await AsyncStorage.removeItem(IS_ADMIN_KEY);
    await AsyncStorage.removeItem(ADMIN_TOKEN_KEY);
  } catch (error) {
    console.error('Error saving auth state:', error);
    throw error;
  }
};

/**
 * Save admin authentication state
 */
export const saveAdminAuthState = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(IS_ADMIN_KEY, 'true');
    await AsyncStorage.setItem(ADMIN_TOKEN_KEY, 'admin_session_token');
    // Clear regular user auth when logging in as admin
    await AsyncStorage.removeItem(USER_ID_KEY);
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Error saving admin auth state:', error);
    throw error;
  }
};

/**
 * Check if user is authenticated
 * @returns Boolean indicating if user is authenticated
 */
export const isUserAuthenticated = async (): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    const userId = await AsyncStorage.getItem(USER_ID_KEY);
    return !!token && !!userId;
  } catch (error) {
    console.error('Error checking auth state:', error);
    return false;
  }
};

/**
 * Check if admin is authenticated
 * @returns Boolean indicating if admin is authenticated
 */
export const isAdminAuthenticated = async (): Promise<boolean> => {
  try {
    const isAdmin = await AsyncStorage.getItem(IS_ADMIN_KEY);
    const adminToken = await AsyncStorage.getItem(ADMIN_TOKEN_KEY);
    return isAdmin === 'true' && !!adminToken;
  } catch (error) {
    console.error('Error checking admin auth state:', error);
    return false;
  }
};

/**
 * Get current user ID
 * @returns User ID or null if not authenticated
 */
export const getUserId = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(USER_ID_KEY);
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
};

/**
 * Get authentication token
 * @returns Auth token or null if not authenticated
 */
export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

/**
 * Clear all authentication state (logout)
 */
export const clearAuthState = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(USER_ID_KEY);
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    await AsyncStorage.removeItem(IS_ADMIN_KEY);
    await AsyncStorage.removeItem(ADMIN_TOKEN_KEY);
  } catch (error) {
    console.error('Error clearing auth state:', error);
    throw error;
  }
};

// Create a default export object with all the functions
const authState = {
  saveUserAuthState,
  saveAdminAuthState,
  isUserAuthenticated,
  isAdminAuthenticated,
  getUserId,
  getAuthToken,
  clearAuthState,
};

// Add a dummy component as default export to satisfy expo-router
const AuthStateComponent = () => null;
AuthStateComponent.displayName = 'AuthState';

// Export the object as a property of the component
AuthStateComponent.authState = authState;

export default AuthStateComponent;
