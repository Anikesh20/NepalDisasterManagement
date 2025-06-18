import { LinearGradient } from 'expo-linear-gradient';
import * as ExpoSplashScreen from 'expo-splash-screen';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, Platform, StyleSheet, Text, View } from 'react-native';

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
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<Error | null>(null);

  useEffect(() => {
    console.log('[SplashScreen] Component mounted');
    let isMounted = true;
    let animationTimeout: NodeJS.Timeout;
    let initTimeout: NodeJS.Timeout;

    const initialize = async () => {
      try {
        console.log('[SplashScreen] Starting initialization...');

        // Hide the native splash screen first
        try {
          await ExpoSplashScreen.hideAsync();
          console.log('[SplashScreen] Native splash screen hidden successfully');
        } catch (error) {
          console.error('[SplashScreen] Error hiding native splash screen:', error);
          // Continue even if hiding fails
        }

        // Wait for native bridge to be ready
        await new Promise(resolve => setTimeout(resolve, 100));

        if (!isMounted) return;

        // Start animations
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
            // Configure system UI after animations
            initTimeout = setTimeout(async () => {
              if (!isMounted) return;

              try {
                if (Platform.OS === 'android') {
                  const systemUIManager = await import('../utils/systemUIManager');
                  await systemUIManager.default.hideNavigationBar();
                  await systemUIManager.default.setImmersiveMode();
                }
                
                setIsInitialized(true);
                onAnimationComplete();
              } catch (error) {
                console.error('[SplashScreen] Error during system UI configuration:', error);
                // Continue even if system UI configuration fails
                setIsInitialized(true);
                onAnimationComplete();
              }
            }, 200);
          }
        });

      } catch (error) {
        console.error('[SplashScreen] Error during initialization:', error);
        if (isMounted) {
          setInitError(error as Error);
          setIsInitialized(true);
          onAnimationComplete();
        }
      }
    };

    // Start initialization
    initialize();

    return () => {
      console.log('[SplashScreen] Component unmounting');
      isMounted = false;
      if (animationTimeout) {
        clearTimeout(animationTimeout);
      }
      if (initTimeout) {
        clearTimeout(initTimeout);
      }
    };
  }, []);

  // If there was an initialization error, show a fallback UI
  if (initError) {
    return (
      <View style={[styles.container, { backgroundColor: '#fff' }]}>
        <Text style={{ color: '#000', fontSize: 16 }}>Loading...</Text>
      </View>
    );
  }

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
