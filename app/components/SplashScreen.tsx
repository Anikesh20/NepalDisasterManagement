import { LinearGradient } from 'expo-linear-gradient';
import * as ExpoSplashScreen from 'expo-splash-screen';
import React, { useEffect, useRef } from 'react';
import { Animated, Image, Platform, StyleSheet, View } from 'react-native';

// Prevent the splash screen from auto-hiding
ExpoSplashScreen.preventAutoHideAsync();

interface SplashScreenProps {
  onAnimationComplete: () => void;
}

// Get window dimensions if needed later
// // We'll use Dimensions in the styles if needed
// const { width, height } = Dimensions.get('window');

const SplashScreen: React.FC<SplashScreenProps> = ({ onAnimationComplete }) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Hide the native splash screen and configure system UI
    const initialize = async () => {
      try {
        console.log('Initializing SplashScreen component...');

        // Hide the native splash screen
        await ExpoSplashScreen.hideAsync();
        console.log('Native splash screen hidden');

        // Hide navigation bar on Android
        if (Platform.OS === 'android') {
          try {
            console.log('Configuring Android UI...');
            // For now, skip the system UI manager to avoid potential issues
            /*
            // Import our SystemUIManager
            const systemUIManager = await import('../utils/systemUIManager');

            // Hide navigation bar and set immersive mode
            await systemUIManager.default.hideNavigationBar();
            await systemUIManager.default.setImmersiveMode();
            */
          } catch (error) {
            console.error('Error configuring Android UI:', error);
          }
        }
      } catch (e) {
        console.log("Error during initialization:", e);
      }
    };

    // Initialize immediately
    initialize();

    // Start animations when component mounts
    Animated.sequence([
      // Fade in and scale up
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
      ]),

      // Rotate for 2 seconds
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),

      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Call the callback when animation completes
      onAnimationComplete();
    });
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
