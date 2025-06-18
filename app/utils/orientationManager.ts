import * as ScreenOrientation from 'expo-screen-orientation';
import { Platform } from 'react-native';

/**
 * Utility for managing screen orientation
 */
class OrientationManager {
  /**
   * Set screen orientation to landscape for admin screens
   */
  setLandscapeOrientation = async (): Promise<void> => {
    try {
      console.log('OrientationManager: Attempting to set landscape orientation');
      console.log('OrientationManager: Platform:', Platform.OS);
      
      if (!this.isOrientationSupported()) {
        console.log('OrientationManager: Orientation changes not supported on this platform');
        return;
      }

      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      console.log('OrientationManager: Landscape orientation set successfully');
      
      // Verify the orientation was set
      const currentOrientation = await this.getCurrentOrientation();
      console.log('OrientationManager: Current orientation after setting landscape:', currentOrientation);
    } catch (error) {
      console.error('OrientationManager: Failed to set landscape orientation:', error);
    }
  };

  /**
   * Set screen orientation to portrait (default)
   */
  setPortraitOrientation = async (): Promise<void> => {
    try {
      console.log('OrientationManager: Attempting to set portrait orientation');
      
      if (!this.isOrientationSupported()) {
        console.log('OrientationManager: Orientation changes not supported on this platform');
        return;
      }

      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
      console.log('OrientationManager: Portrait orientation set successfully');
      
      // Verify the orientation was set
      const currentOrientation = await this.getCurrentOrientation();
      console.log('OrientationManager: Current orientation after setting portrait:', currentOrientation);
    } catch (error) {
      console.error('OrientationManager: Failed to set portrait orientation:', error);
    }
  };

  /**
   * Allow all orientations
   */
  allowAllOrientations = async (): Promise<void> => {
    try {
      console.log('OrientationManager: Allowing all screen orientations');
      await ScreenOrientation.unlockAsync();
      console.log('OrientationManager: All orientations allowed successfully');
    } catch (error) {
      console.error('OrientationManager: Failed to allow all orientations:', error);
    }
  };

  /**
   * Get current screen orientation
   */
  getCurrentOrientation = async (): Promise<ScreenOrientation.Orientation> => {
    try {
      const orientation = await ScreenOrientation.getOrientationAsync();
      console.log('OrientationManager: Current orientation:', orientation);
      return orientation;
    } catch (error) {
      console.error('OrientationManager: Failed to get current orientation:', error);
      return ScreenOrientation.Orientation.PORTRAIT_UP;
    }
  };

  /**
   * Check if current orientation is landscape
   */
  isLandscape = async (): Promise<boolean> => {
    try {
      const orientation = await this.getCurrentOrientation();
      const isLandscape = orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT || 
                         orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT;
      console.log('OrientationManager: Is landscape:', isLandscape);
      return isLandscape;
    } catch (error) {
      console.error('OrientationManager: Failed to check landscape orientation:', error);
      return false;
    }
  };

  /**
   * Check if device supports orientation changes
   */
  isOrientationSupported = (): boolean => {
    const supported = Platform.OS === 'ios' || Platform.OS === 'android';
    console.log('OrientationManager: Orientation supported:', supported, 'Platform:', Platform.OS);
    return supported;
  };

  /**
   * Add orientation change listener
   */
  addOrientationChangeListener = (callback: (orientation: ScreenOrientation.Orientation) => void) => {
    return ScreenOrientation.addOrientationChangeListener(callback);
  };

  /**
   * Remove orientation change listener
   */
  removeOrientationChangeListener = (subscription: ScreenOrientation.Subscription) => {
    subscription.remove();
  };
}

export default new OrientationManager(); 