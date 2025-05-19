import * as SystemUI from 'expo-system-ui';
import { Platform } from 'react-native';

/**
 * Configure system UI settings for the app
 */
export const configureSystemUI = async () => {
  try {
    // Set the navigation bar to be hidden on Android
    if (Platform.OS === 'android') {
      await SystemUI.setNavigationBarVisibility('hidden');
    }
  } catch (error) {
    console.error('Error configuring system UI:', error);
  }
};

export default {
  configureSystemUI,
};
