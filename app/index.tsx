import { Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import SplashScreen from './components/SplashScreen';
import { colors } from './styles/theme';
import * as AuthStateComponent from './utils/authState';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUser, setIsUser] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      // Hide navigation bar on Android
      if (Platform.OS === 'android') {
        try {
          const systemUIManager = await import('./utils/systemUIManager');
          await systemUIManager.default.hideNavigationBar();
          await systemUIManager.default.setImmersiveMode();
        } catch (error) {
          console.error('Error hiding navigation bar:', error);
        }
      }
      
      // Check authentication status
      await checkAuthStatus();
    };

    initializeApp();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('[Index] Starting authentication check...');

      // Check both admin and user authentication
      console.log('[Index] Checking admin authentication...');
      const adminAuth = await AuthStateComponent.authState.isAdminAuthenticated();
      console.log('[Index] Checking user authentication...');
      const userAuth = await AuthStateComponent.authState.isUserAuthenticated();

      console.log('[Index] Auth status:', { adminAuth, userAuth });

      // Ensure we're not in an invalid state (both admin and user authenticated)
      if (adminAuth && userAuth) {
        console.log('[Index] Invalid state detected: both admin and user are authenticated');
        await AuthStateComponent.authState.clearAuthState();
        setIsAdmin(false);
        setIsUser(false);
      } else {
        setIsAdmin(adminAuth);
        setIsUser(userAuth);
      }
      
      setIsLoading(false);
      console.log('[Index] Auth check complete, loading state updated');
    } catch (error) {
      console.error('[Index] Error checking authentication status:', error);
      // On error, clear auth state and set to not authenticated
      try {
        await AuthStateComponent.authState.clearAuthState();
      } catch (clearError) {
        console.error('[Index] Error clearing auth state:', clearError);
      }
      setIsAdmin(false);
      setIsUser(false);
      setIsLoading(false);
    }
  };

  const handleSplashComplete = () => {
    console.log('[Index] Splash screen animation complete');
    setShowSplash(false);
  };

  if (showSplash) {
    console.log('[Index] Rendering splash screen');
    return <SplashScreen onAnimationComplete={handleSplashComplete} />;
  }

  if (isLoading) {
    console.log('[Index] Rendering loading indicator');
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  console.log('[Index] Rendering main content, auth state:', { isAdmin, isUser });
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
