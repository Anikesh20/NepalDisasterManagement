import { LinearGradient } from 'expo-linear-gradient';
import * as ExpoSplashScreen from 'expo-splash-screen';
import React, { useEffect, useRef } from 'react';
import { Animated, Image, Platform, StyleSheet, View } from 'react-native';

// Prevent the splash screen from auto-hiding
ExpoSplashScreen.preventAutoHideAsync().catch(() => {
  /* ignore error */
});

interface SplashScreenProps {
  onAnimationComplete: () => void;
}

// Get window dimensions if needed later
// // We'll use Dimensions in the styles if needed
// const { width, height } = Dimensions.get('window');

const SplashScreen: React.FC<SplashScreenProps> = ({ onAnimationComplete }) => {
  console.log('[SplashScreen] Component rendering');
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    console.log('[SplashScreen] Component mounted');
    let isMounted = true;
    let animationTimeout: NodeJS.Timeout;

    // Hide the native splash screen and configure system UI
    const initialize = async () => {
      try {
        console.log('[SplashScreen] Starting initialization...');

        // Start animations immediately
        console.log('[SplashScreen] Starting animations...');
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]).start(() => {
          console.log('[SplashScreen] Animations completed');
          if (isMounted) {
            // Add a small delay before completing to ensure smooth transition
            animationTimeout = setTimeout(() => {
              if (isMounted) {
                onAnimationComplete();
              }
            }, 200);
          }
        });

        // Hide the native splash screen in parallel
        console.log('[SplashScreen] Attempting to hide native splash screen...');
        try {
          await ExpoSplashScreen.hideAsync();
          console.log('[SplashScreen] Native splash screen hidden successfully');
        } catch (error) {
          console.error('[SplashScreen] Error hiding native splash screen:', error);
          // Continue even if hiding fails
        }

        if (!isMounted) {
          console.log('[SplashScreen] Component unmounted during initialization');
          return;
        }

        // Hide navigation bar on Android
        if (Platform.OS === 'android') {
          try {
            console.log('[SplashScreen] Configuring Android UI...');
            // Import our SystemUIManager
            const systemUIManager = await import('../utils/systemUIManager');

            // Hide navigation bar and set immersive mode
            await systemUIManager.default.hideNavigationBar();
            await systemUIManager.default.setImmersiveMode();
            console.log('[SplashScreen] Android UI configured successfully');
          } catch (error) {
            console.error('[SplashScreen] Error configuring Android UI:', error);
            // Continue even if UI configuration fails
          }
        }

      } catch (error) {
        console.error('[SplashScreen] Error during initialization:', error);
        // If there's an error, we should still try to complete the animation
        if (isMounted) {
          onAnimationComplete();
        }
      }
    };

    initialize();

    return () => {
      console.log('[SplashScreen] Component unmounting');
      isMounted = false;
      if (animationTimeout) {
        clearTimeout(animationTimeout);
      }
    };
  }, []);

  // Interpolate rotation value
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [
              { rotate: spin },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={['#4A90E2', '#357ABD']}
          style={styles.glowContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.innerContainer}>
            <View style={styles.imageContainer}>
              <Image
                source={require('../../assets/images/icon.png')}
                style={styles.image}
                resizeMode="cover"
              />
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  logoContainer: {
    width: 180,
    height: 180,
    borderRadius: 9999,
    overflow: 'hidden',
  },
  glowContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 9999,
    padding: 2,
  },
  innerContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 2,
  },
  imageContainer: {
    width: '90%',
    height: '90%',
    borderRadius: 9999,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 9999,
  },
});

export default SplashScreen;
