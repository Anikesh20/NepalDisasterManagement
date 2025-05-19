import { Ionicons } from '@expo/vector-icons';
import { Stack, usePathname, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { colors } from '../styles/theme';

export default function AdminLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    try {
      // Import the auth state utility
      const { isAdminAuthenticated } = await import('../utils/authState');

      // Check if admin is authenticated
      const isAuthenticated = await isAdminAuthenticated();

      if (!isAuthenticated) {
        // Not authenticated as admin, redirect to login screen
        router.replace('/(auth)/LoginScreen');
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error checking admin auth:', error);
      setIsLoading(false);
      router.replace('/(auth)/LoginScreen');
    }
  };

  const handleLogout = async () => {
    try {
      // Import the auth state utility
      const { clearAuthState } = await import('../utils/authState');

      // Clear all authentication state
      await clearAuthState();

      // Navigate to login screen
      router.replace('/(auth)/LoginScreen');
    } catch (error) {
      console.error('Error during admin logout:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }



  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1a237e', // Darker blue for admin
            paddingTop: 10, // Add padding to avoid status bar overlap
          },
          headerStatusBarHeight: 40, // Add extra padding for status bar
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerRight: () => (
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <View style={styles.logoutButtonContent}>
                <Ionicons name="log-out-outline" size={24} color="#fff" />
                <Text style={styles.logoutButtonText}>Logout</Text>
              </View>
            </TouchableOpacity>
          ),
          headerLeft: () => {
            // Only show back button if not on the main admin screen
            if (pathname !== '/(admin)') {
              return (
                <TouchableOpacity
                  onPress={() => router.back()}
                  style={styles.backButton}
                >
                  <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
              );
            }
            return null;
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'Admin Dashboard',
          }}
        />
        <Stack.Screen
          name="users"
          options={{
            title: 'User Management',
          }}
        />
        <Stack.Screen
          name="disasters"
          options={{
            title: 'Disaster Management',
          }}
        />
        <Stack.Screen
          name="reports"
          options={{
            title: 'Report Management',
          }}
        />
        <Stack.Screen
          name="donations"
          options={{
            title: 'Donation Management',
          }}
        />
        <Stack.Screen
          name="volunteers"
          options={{
            title: 'Volunteer Management',
          }}
        />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButton: {
    padding: 8,
    marginRight: 8,
  },
  logoutButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  backButton: {
    padding: 8,
  },
});
