import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, shadows } from '../styles/theme-simple';

interface SettingItem {
  title: string;
  description: string;
  icon: string;
  type: 'toggle' | 'button';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
}

export default function SettingsScreen() {
  const router = useRouter();
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);

  useEffect(() => {
    checkBiometricAvailability();
    loadSettings();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setIsBiometricAvailable(compatible && enrolled);
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      setIsBiometricAvailable(false);
    }
  };

  const loadSettings = async () => {
    try {
      const [biometricEnabled, darkMode, notifications] = await Promise.all([
        AsyncStorage.getItem('biometricEnabled'),
        AsyncStorage.getItem('darkMode'),
        AsyncStorage.getItem('notificationsEnabled'),
      ]);

      setIsBiometricEnabled(biometricEnabled === 'true');
      setIsDarkMode(darkMode === 'true');
      setIsNotificationsEnabled(notifications !== 'false');
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleBiometricToggle = async (value: boolean) => {
    try {
      if (value) {
        // Verify biometric authentication before enabling
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Authenticate to enable biometric login',
          fallbackLabel: 'Use password',
        });

        if (!result.success) {
          return;
        }
      }

      await AsyncStorage.setItem('biometricEnabled', String(value));
      setIsBiometricEnabled(value);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Error toggling biometric:', error);
      Alert.alert('Error', 'Failed to update biometric settings');
    }
  };

  const handleDarkModeToggle = async (value: boolean) => {
    try {
      await AsyncStorage.setItem('darkMode', String(value));
      setIsDarkMode(value);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      // TODO: Implement theme switching
    } catch (error) {
      console.error('Error toggling dark mode:', error);
    }
  };

  const handleNotificationsToggle = async (value: boolean) => {
    try {
      await AsyncStorage.setItem('notificationsEnabled', String(value));
      setIsNotificationsEnabled(value);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      // TODO: Implement notification settings
    } catch (error) {
      console.error('Error toggling notifications:', error);
    }
  };

  const handleClearData = async () => {
    Alert.alert(
      'Clear App Data',
      'Are you sure you want to clear all app data? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              router.replace('/(auth)/LoginScreen');
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Error', 'Failed to clear app data');
            }
          },
        },
      ]
    );
  };

  const settings: SettingItem[] = [
    {
      title: 'Biometric Login',
      description: 'Use fingerprint or face recognition to login',
      icon: 'finger-print-outline',
      type: 'toggle',
      value: isBiometricEnabled,
      onToggle: handleBiometricToggle,
      disabled: !isBiometricAvailable,
    },
    {
      title: 'Dark Mode',
      description: 'Enable dark theme for the app',
      icon: 'moon-outline',
      type: 'toggle',
      value: isDarkMode,
      onToggle: handleDarkModeToggle,
    },
    {
      title: 'Notifications',
      description: 'Enable push notifications for alerts and updates',
      icon: 'notifications-outline',
      type: 'toggle',
      value: isNotificationsEnabled,
      onToggle: handleNotificationsToggle,
    },
    {
      title: 'Clear App Data',
      description: 'Remove all saved data and return to login screen',
      icon: 'trash-outline',
      type: 'button',
      onPress: handleClearData,
    },
  ];

  const renderSettingItem = (item: SettingItem, index: number) => (
    <Animated.View
      key={index}
      entering={FadeInDown.delay(index * 100).duration(400)}
      style={styles.settingItem}
    >
      <View style={styles.settingIconContainer}>
        <Ionicons name={item.icon as any} size={24} color={colors.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{item.title}</Text>
        <Text style={styles.settingDescription}>{item.description}</Text>
      </View>
      {item.type === 'toggle' ? (
        <Switch
          value={item.value}
          onValueChange={item.onToggle}
          disabled={item.disabled}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor="#fff"
        />
      ) : (
        <TouchableOpacity
          style={styles.buttonContainer}
          onPress={item.onPress}
        >
          <Ionicons name="chevron-forward" size={24} color={colors.textLight} />
        </TouchableOpacity>
      )}
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          {settings.map(renderSettingItem)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.aboutContainer}>
            <Text style={styles.appName}>Nepal Disaster Management</Text>
            <Text style={styles.appVersion}>Version 1.0.0</Text>
            <Text style={styles.appDescription}>
              A comprehensive disaster management app for Nepal, helping citizens stay safe and informed during emergencies.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    ...shadows.small,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: colors.textLight,
  },
  buttonContainer: {
    padding: 8,
  },
  aboutContainer: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    ...shadows.small,
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 8,
  },
  appDescription: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20,
  },
}); 