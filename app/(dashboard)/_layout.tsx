import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { logout } from '../services/authService';

export default function DashboardLayout() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Import the auth state utility
      const { clearAuthState } = await import('../utils/authState');

      // Clear authentication state
      await clearAuthState();

      // Call the logout function from authService
      await logout();

      // Navigate to login screen
      router.replace('/(auth)/LoginScreen');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#007AFF',
          paddingTop: 10, // Add padding to avoid status bar overlap
        },
        headerStatusBarHeight: 40, // Add extra padding for status bar
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerRight: () => (
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color="#fff" />
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Dashboard',
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          title: 'My Profile',
        }}
      />
      <Stack.Screen
        name="report-disaster"
        options={{
          title: 'Report Disaster',
        }}
      />
      <Stack.Screen
        name="volunteer-status"
        options={{
          title: 'Volunteer Status',
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    padding: 8,
  },
});