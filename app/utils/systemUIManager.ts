import { Platform } from 'react-native';

/**
 * Utility for managing system UI elements like navigation bar and status bar
 */
class SystemUIManager {
  /**
   * Hide the Android navigation bar
   */
  hideNavigationBar = async (): Promise<void> => {
    if (Platform.OS !== 'android') return;

    try {
      console.log('Attempting to hide navigation bar');
      // Simplified approach to avoid dynamic imports
      const NavigationBar = require('expo-navigation-bar');

      // Hide the navigation bar
      await NavigationBar.setVisibilityAsync('hidden');

      // Set the navigation bar color to transparent as a fallback
      await NavigationBar.setBackgroundColorAsync('transparent');

      console.log('Navigation bar hidden successfully');
    } catch (error) {
      console.error('Failed to hide navigation bar:', error);
    }
  };

  /**
   * Show the Android navigation bar
   */
  showNavigationBar = async (): Promise<void> => {
    if (Platform.OS !== 'android') return;

    try {
      console.log('Attempting to show navigation bar');
      // Simplified approach to avoid dynamic imports
      const NavigationBar = require('expo-navigation-bar');

      // Show the navigation bar
      await NavigationBar.setVisibilityAsync('visible');

      console.log('Navigation bar shown successfully');
    } catch (error) {
      console.error('Failed to show navigation bar:', error);
    }
  };

  /**
   * Set the Android navigation bar to immersive mode
   * This hides both the navigation bar and status bar until the user swipes from the edge
   */
  setImmersiveMode = async (): Promise<void> => {
    if (Platform.OS !== 'android') return;

    try {
      console.log('Attempting to set immersive mode');
      // Simplified approach to avoid dynamic imports
      const NavigationBar = require('expo-navigation-bar');

      // Set the navigation bar to overlay mode
      await NavigationBar.setBehaviorAsync('overlay-swipe');

      // Hide the navigation bar
      await NavigationBar.setVisibilityAsync('hidden');

      console.log('Immersive mode set successfully');
    } catch (error) {
      console.error('Failed to set immersive mode:', error);
    }
  };
}

export default new SystemUIManager();
