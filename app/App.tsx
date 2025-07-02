import * as Device from 'expo-device';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Slot } from 'expo-router';
import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  useEffect(() => {
    const requestPermissions = async () => {
      // Request location permission
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      if (locationStatus !== 'granted') {
        Alert.alert('Permission Required', 'Location permission is required for disaster and weather features.');
      }
      // Request notification permission
      if (Device.isDevice) {
        const { status: notifStatus } = await Notifications.requestPermissionsAsync();
        if (notifStatus !== 'granted') {
          Alert.alert('Permission Required', 'Notification permission is required to receive disaster alerts.');
        }
      }
      // (Network access is handled by AndroidManifest.xml)
    };
    requestPermissions();
  }, []);

  return (
    <SafeAreaProvider>
      <Slot />
    </SafeAreaProvider>
  );
} 