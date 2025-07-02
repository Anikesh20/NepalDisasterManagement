// Futuristic and Enhanced LoginScreen with Improved Gradient and Biometric UI

import { FontAwesome, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../components/Button';
import FormInput from '../components/FormInput';
import Logo from '../components/Logo';
import { login } from '../services/authService';
import { colors } from '../styles/theme-simple';

const { height } = Dimensions.get('window');

const LoginScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Static background gradient for light theme
  const gradientColors = ['#fdfcfb', '#e2d1f9', '#c1d3fe'];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);

  const buttonScale = useSharedValue(1);

  useEffect(() => {
    (async () => {
      try {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        if (!compatible) {
          console.log('Biometric hardware not available');
          setIsBiometricAvailable(false);
          return;
        }

        const enrolled = await LocalAuthentication.isEnrolledAsync();
        if (!enrolled) {
          console.log('No biometrics enrolled');
          setIsBiometricAvailable(false);
          return;
        }

        // Check if we have biometric enabled in settings
        const biometricEnabled = await AsyncStorage.getItem('biometricEnabled');
        setIsBiometricAvailable(compatible && enrolled && biometricEnabled === 'true');
      } catch (error) {
        console.error('Error checking biometric availability:', error);
        setIsBiometricAvailable(false);
      }
    })();
  }, []);

  const handleBiometricLogin = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to login',
        fallbackLabel: 'Use password',
        disableDeviceFallback: false,
        cancelLabel: 'Cancel'
      });

      if (result.success) {
        // Try to get stored credentials
        const storedEmail = await AsyncStorage.getItem('lastLoginEmail');
        const storedPassword = await AsyncStorage.getItem('lastLoginPassword');
        
        if (storedEmail && storedPassword) {
          await handleLogin(storedEmail, storedPassword);
        } else {
          Alert.alert('Error', 'No stored credentials found. Please login with password first.');
        }
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      Alert.alert('Error', 'Biometric authentication failed. Please try password login.');
    }
  };

  const handleLogin = async (loginEmail = email, loginPassword = password) => {
    if (!loginEmail) return setEmailError('Email is required');
    if (!loginPassword) return setPasswordError('Password is required');

    setIsLoading(true);
    try {
      const response = await login(loginEmail, loginPassword);
      const { saveUserAuthState, saveAdminAuthState } = await import('../utils/authState');
      
      // Store credentials for biometric login if biometric is available
      if (isBiometricAvailable) {
        await AsyncStorage.setItem('lastLoginEmail', loginEmail);
        await AsyncStorage.setItem('lastLoginPassword', loginPassword);
      }

      if (response.user.is_admin) {
        await saveAdminAuthState(response.token);
        router.replace('/(admin)');
      } else {
        await saveUserAuthState(response.user.id.toString(), response.token);
        router.replace('/(dashboard)');
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      console.error('Login error:', err);
      Alert.alert('Login Failed', err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const loginButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }]
  }));

  // Animated style for biometric button
  const biometricScale = useSharedValue(1);
  const biometricStyle = useAnimatedStyle(() => ({
    transform: [{ scale: biometricScale.value }]
  }));

  return (
    <LinearGradient
      colors={gradientColors as any}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.delay(300).duration(800)} style={styles.logoContainer}>
            <Logo size="large" />
            <Text style={styles.curvyLabel}>SAJILO SAHAYOG</Text>
          </Animated.View>

          {/* Glassmorphic Card */}
          <BlurView intensity={80} tint="light" style={styles.glassCard}>
            <FormInput
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={(text) => { setEmail(text); setEmailError(''); }}
              keyboardType="email-address"
              autoCapitalize="none"
              error={emailError}
            />

            <FormInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={(text) => { setPassword(text); setPasswordError(''); }}
              secureTextEntry
              error={passwordError}
            />

            {/* Login Button */}
            <Animated.View entering={FadeInUp.delay(800)} style={loginButtonStyle}>
              <Button
                title={isLoading ? 'Logging in...' : 'Login'}
                onPress={() => {
                  buttonScale.value = withSequence(withTiming(0.9), withSpring(1));
                  handleLogin();
                }}
                disabled={isLoading}
                type="primary"
              />
            </Animated.View>
          </BlurView>

          {/* Divider */}
          <Text style={styles.loginWithText}>Login with</Text>

          {/* Social Icons */}
          <View style={styles.socialIconContainer}>
            <Pressable onPress={() => Alert.alert('Google login coming soon!')} style={styles.socialPressable}>
              <FontAwesome name="google" size={26} color="#DB4437" />
            </Pressable>
            <Pressable onPress={() => Alert.alert('Facebook login coming soon!')} style={styles.socialPressable}>
              <FontAwesome name="facebook" size={26} color="#4267B2" />
            </Pressable>
          </View>

          {/* Biometric Login */}
          {isBiometricAvailable && (
            <Animated.View entering={FadeInUp.delay(1000)} style={[styles.biometricWrapper, biometricStyle]}>
              <Pressable
                onPress={() => {
                  biometricScale.value = withSequence(withTiming(0.9), withSpring(1));
                  handleBiometricLogin();
                }}
              >
                <LinearGradient
                  colors={['#a1c4fd', '#c2e9fb']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.biometricBtn}
                >
                  <Ionicons name="finger-print" size={28} color="#fff" />
                </LinearGradient>
                <Text style={[styles.biometricText, { color: colors.text }]}>Login with Biometrics</Text>
              </Pressable>
            </Animated.View>
          )}

          {/* Sign‑up */}
          <View style={styles.signupContainer}>
            <Text style={{ color: colors.text }}>New here?</Text>
            <Pressable onPress={() => router.push('/(auth)/SignupScreen')}>
              <Text style={{ color: colors.primary, marginLeft: 6, fontWeight: '600' }}>Sign Up</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingTop: height * 0.05
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30
  },
  curvyLabel: {
    fontSize: 34,
    fontWeight: '700',
    fontStyle: 'italic',
    fontFamily: Platform.OS === 'ios' ? 'Cochin' : 'cursive',
    color: '#d62828',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 12
  },
  glassCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden'
  },
  socialIconContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 30,
    marginVertical: 14
  },
  socialPressable: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 14,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2
  },
  loginWithText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#555'
  },
  biometricWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
    width: '100%',
  },
  biometricBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
    alignSelf: 'center',
  },
  biometricText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10
  }
});

export default LoginScreen;
