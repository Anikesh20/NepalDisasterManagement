import { Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import SplashScreen from './components/SplashScreen';
import { colors } from './styles/theme';
import { clearAuthState, isAdminAuthenticated, isUserAuthenticated } from './utils/authState';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUser, setIsUser] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initAttempts, setInitAttempts] = useState(0);
  const MAX_INIT_ATTEMPTS = 3;

  useEffect(() => {
    let isMounted = true;
    let initTimeout: NodeJS.Timeout;
    let retryTimeout: NodeJS.Timeout;

    const initializeApp = async () => {
      try {
        console.log('[Index] Starting app initialization, attempt:', initAttempts + 1);
        
        // Add a small delay before initialization to ensure native bridge is ready
        await new Promise(resolve => setTimeout(resolve, 100));

        if (!isMounted) return;

        // Check authentication status with retry logic
        await checkAuthStatus();

        if (isMounted) {
          console.log('[Index] App initialization successful');
          setError(null);
        }
      } catch (err) {
        console.error('[Index] Error during app initialization:', err);
        if (isMounted) {
          if (initAttempts < MAX_INIT_ATTEMPTS) {
            console.log('[Index] Retrying initialization...');
            retryTimeout = setTimeout(() => {
              if (isMounted) {
                setInitAttempts(prev => prev + 1);
              }
            }, 1000 * (initAttempts + 1)); // Exponential backoff
          } else {
            setError('Failed to initialize app. Please try again.');
            setIsLoading(false);
          }
        }
      }
    };

    // Start initialization after a small delay
    initTimeout = setTimeout(() => {
      initializeApp();
    }, 500);

    return () => {
      isMounted = false;
      if (initTimeout) {
        clearTimeout(initTimeout);
      }
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [initAttempts]); // Add initAttempts as dependency

  const checkAuthStatus = async () => {
    try {
      console.log('[Index] Starting authentication check...');

      // Add retry logic for auth checks
      const maxRetries = 3;
      let retryCount = 0;
      let adminAuth = false;
      let userAuth = false;
      let lastError: Error | null = null;

      while (retryCount < maxRetries) {
        try {
          // Check both auth states in parallel
          const [adminResult, userResult] = await Promise.all([
            isAdminAuthenticated(),
            isUserAuthenticated()
          ]);

          adminAuth = adminResult;
          userAuth = userResult;
          break;
        } catch (err) {
          lastError = err as Error;
          retryCount++;
          if (retryCount === maxRetries) throw lastError;
          await new Promise(resolve => setTimeout(resolve, 500 * retryCount));
        }
      }

      console.log('[Index] Auth status:', { adminAuth, userAuth });

      if (adminAuth && userAuth) {
        console.log('[Index] Invalid state detected: both admin and user are authenticated');
        await clearAuthState();
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
      try {
        await clearAuthState();
      } catch (clearError) {
        console.error('[Index] Error clearing auth state:', clearError);
      }
      setIsAdmin(false);
      setIsUser(false);
      setIsLoading(false);
      throw error; // Re-throw to trigger retry logic
    }
  };

  const handleSplashComplete = () => {
    console.log('[Index] Splash screen animation complete');
    setShowSplash(false);
  };

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    setInitAttempts(0); // Reset init attempts
  };

  if (showSplash) {
    console.log('[Index] Rendering splash screen');
    return <SplashScreen onAnimationComplete={handleSplashComplete} />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={handleRetry}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    console.log('[Index] Rendering loading indicator');
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        {initAttempts > 0 && (
          <Text style={styles.retryText}>Retrying initialization... ({initAttempts}/{MAX_INIT_ATTEMPTS})</Text>
        )}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.background,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  retryText: {
    marginTop: 10,
    color: colors.textLight,
    fontSize: 14,
  },
});
