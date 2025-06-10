import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as Haptics from 'expo-haptics';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { logout } from '../services/authService';
import { colors } from '../styles/theme';

export default function DashboardLayout() {
  const router = useRouter();

  useEffect(() => {
    const hideNavigationBar = async () => {
      if (Platform.OS === 'android') {
        try {
          const systemUIManager = await import('../utils/systemUIManager');
          await systemUIManager.default.hideNavigationBar();
          await systemUIManager.default.setImmersiveMode();
        } catch (error) {
          console.error('Error hiding navigation bar:', error);
        }
      }
    };

    hideNavigationBar();
  }, []);

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

  // Get the status bar height
  const statusBarHeight = Constants.statusBarHeight;

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: true,
          header: ({ navigation, route, options }) => {
            // Don't show header on the main dashboard screen
            if (route.name === 'index') {
              return null;
            }

            // Special header for weather screen with refresh button
            if (route.name === 'weather') {
              return (
                <View style={[styles.headerContainer, { paddingTop: statusBarHeight + 10 }]}>
                  <View style={styles.header}>
                    <TouchableOpacity
                      style={styles.backButton}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        navigation.goBack();
                      }}
                    >
                      <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{options.title || route.name}</Text>
                    <TouchableOpacity
                      style={styles.refreshButton}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        // Trigger refresh through navigation params
                        navigation.setParams({ refresh: Date.now() });
                      }}
                    >
                      <Ionicons name="refresh" size={24} color={colors.text} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }

            // Default header for other screens
            return (
              <View style={[styles.headerContainer, { paddingTop: statusBarHeight + 10 }]}>
                <View style={styles.header}>
                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      navigation.goBack();
                    }}
                  >
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                  </TouchableOpacity>
                  <Text style={styles.headerTitle}>{options.title || route.name}</Text>
                  {route.name === 'my-reports' && (
                    <TouchableOpacity
                      style={styles.headerRightButton}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        navigation.navigate('report-disaster');
                      }}
                    >
                      <Ionicons name="add" size={24} color={colors.primary} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          },
          headerStyle: {
            backgroundColor: colors.background,
            height: Platform.OS === 'ios' ? 120 : 100,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          },
          contentStyle: {
            backgroundColor: colors.background,
            paddingTop: Platform.OS === 'ios' ? 0 : 10, // Add padding for Android
          },
          headerStatusBarHeight: Platform.OS === 'ios' ? 0 : statusBarHeight, // Adjust status bar height
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="profile"
          options={{
            title: 'Edit Profile',
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            title: 'Settings',
          }}
        />
        <Stack.Screen
          name="report-disaster"
          options={{
            title: 'Report a Disaster',
          }}
        />
        <Stack.Screen
          name="volunteer-status"
          options={{
            title: 'Volunteer Status',
          }}
        />
        <Stack.Screen
          name="all-actions"
          options={{
            title: 'All Actions',
          }}
        />
        <Stack.Screen
          name="emergency-contacts"
          options={{
            title: 'Emergency Contacts',
          }}
        />
        <Stack.Screen
          name="disaster-map"
          options={{
            title: 'Disaster Map',
          }}
        />
        <Stack.Screen
          name="historical-data"
          options={{
            title: 'Historical Data',
          }}
        />
        <Stack.Screen
          name="my-reports"
          options={{
            title: 'My Reports',
          }}
        />
        <Stack.Screen
          name="disaster-details"
          options={{
            title: 'Disaster Details',
          }}
        />
        <Stack.Screen
          name="weather"
          options={{
            title: 'Weather',
          }}
        />
        <Stack.Screen
          name="safety-tips"
          options={{
            title: 'Safety Tips',
          }}
        />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    zIndex: 1, // Ensure header stays on top
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 16,
    marginTop: 10,
  },
  backButton: {
    width: 44, // Slightly larger touch target
    height: 44, // Slightly larger touch target
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  refreshButton: {
    padding: 8,
  },
  headerRightButton: {
    padding: 8,
    marginLeft: 'auto',
  },
});