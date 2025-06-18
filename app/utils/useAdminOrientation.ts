import { useEffect } from 'react';
import OrientationManager from './orientationManager';

/**
 * Custom hook to manage screen orientation for admin screens
 * Forces landscape orientation when the component mounts
 * and only restores portrait orientation when actually leaving admin area
 */
export const useAdminOrientation = () => {
  useEffect(() => {
    let isActive = true;

    const setLandscapeOrientation = async () => {
      if (OrientationManager.isOrientationSupported() && isActive) {
        try {
          console.log('useAdminOrientation: Setting landscape orientation');
          await OrientationManager.setLandscapeOrientation();
          console.log('useAdminOrientation: Landscape orientation set successfully');
        } catch (error) {
          console.error('useAdminOrientation: Error setting landscape orientation:', error);
        }
      }
    };

    // Set landscape orientation when component mounts
    setLandscapeOrientation();

    // Cleanup function - but don't restore portrait immediately
    // This will only run when the component unmounts, but we want to maintain
    // landscape orientation when navigating between admin screens
    return () => {
      isActive = false;
      // Note: We're not restoring portrait orientation here anymore
      // This will be handled by the layout level when actually leaving admin area
      console.log('useAdminOrientation: Component unmounting, maintaining landscape orientation');
    };
  }, []);
};

export default useAdminOrientation; 