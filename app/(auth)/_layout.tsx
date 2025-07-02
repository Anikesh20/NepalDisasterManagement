import { Stack } from "expo-router";
import React, { useEffect } from 'react';
import OrientationManager from '../utils/orientationManager';

export default function AuthLayout() {
  useEffect(() => {
    // Force portrait orientation for auth screens
    const forcePortrait = async () => {
      try {
        console.log('Auth Layout: Setting portrait orientation');
        if (OrientationManager.isOrientationSupported()) {
          await OrientationManager.setPortraitOrientation();
          console.log('Auth Layout: Portrait orientation set successfully');
        }
      } catch (error) {
        console.error('Auth Layout: Error setting portrait orientation:', error);
      }
    };

    forcePortrait();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LoginScreen" />
      <Stack.Screen name="SignupScreen" />
    </Stack>
  );
}
