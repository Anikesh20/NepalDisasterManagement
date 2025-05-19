import { Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import SplashScreen from './components/SplashScreen';
import { colors } from './styles/theme';
import AuthStateComponent from './utils/authState';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUser, setIsUser] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Add a small delay to ensure everything is initialized
    const timer = setTimeout(() => {
      checkAuthStatus();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('Checking authentication status...');

      // For testing purposes, let's clear any existing auth state
      // to ensure we always start at the login screen
      await AuthStateComponent.authState.clearAuthState();

      // Check both admin and user authentication
      const adminAuth = await AuthStateComponent.authState.isAdminAuthenticated();
      const userAuth = await AuthStateComponent.authState.isUserAuthenticated();

      console.log('Auth status:', { adminAuth, userAuth });

      setIsAdmin(adminAuth);
      setIsUser(userAuth);
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking authentication status:', error);
      setIsLoading(false);
    }
  };

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onAnimationComplete={handleSplashComplete} />;
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Redirect based on authentication status
  if (isAdmin) {
    return <Redirect href="/(admin)" />;
  } else if (isUser) {
    return <Redirect href="/(dashboard)" />;
  } else {
    return <Redirect href="/(auth)/LoginScreen" />;
  }
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
