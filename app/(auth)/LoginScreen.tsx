import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    FadeIn,
    FadeInDown,
    FadeInUp,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import AnimatedView from '../components/AnimatedView';
import Background from '../components/Background';
import Button from '../components/Button';
import FormInput from '../components/FormInput';
import Logo from '../components/Logo';
import { login } from '../services/authService';
import { colors, shadows } from '../styles/theme-simple';

const LoginScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);

  // Animation values
  const buttonScale = useSharedValue(1);
  const biometricScale = useSharedValue(1);
  const socialButtonScales = {
    google: useSharedValue(1),
    facebook: useSharedValue(1),
    apple: useSharedValue(1)
  };

  // Animated styles
  const loginButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }]
  }));

  const biometricButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: biometricScale.value }]
  }));

  const socialButtonStyles = {
    google: useAnimatedStyle(() => ({
      transform: [{ scale: socialButtonScales.google.value }]
    })),
    facebook: useAnimatedStyle(() => ({
      transform: [{ scale: socialButtonScales.facebook.value }]
    })),
    apple: useAnimatedStyle(() => ({
      transform: [{ scale: socialButtonScales.apple.value }]
    }))
  };

  // Hide navigation bar when login screen is shown
  useEffect(() => {
    const hideNavigationBar = async () => {
      if (Platform.OS === 'android') {
        try {
          // Import our SystemUIManager
          const systemUIManager = await import('../utils/systemUIManager');

          // Hide navigation bar and set immersive mode
          await systemUIManager.default.hideNavigationBar();
          await systemUIManager.default.setImmersiveMode();
        } catch (error) {
          console.error('Error hiding navigation bar:', error);
        }
      }
    };

    hideNavigationBar();
  }, []);

  useEffect(() => {
    checkBiometricAvailability();
    loadBiometricPreference();
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

  const loadBiometricPreference = async () => {
    try {
      const preference = await AsyncStorage.getItem('biometricEnabled');
      setIsBiometricEnabled(preference === 'true');
    } catch (error) {
      console.error('Error loading biometric preference:', error);
    }
  };

  const toggleBiometric = async () => {
    try {
      const newValue = !isBiometricEnabled;
      await AsyncStorage.setItem('biometricEnabled', String(newValue));
      setIsBiometricEnabled(newValue);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Error toggling biometric:', error);
    }
  };

  const handleBiometricLogin = async () => {
    if (isLoading) return; // Prevent multiple simultaneous attempts
    
    try {
      setIsLoading(true);
      
      // Get stored credentials first
      const [storedEmail, storedPassword] = await Promise.all([
        AsyncStorage.getItem('lastLoginEmail'),
        AsyncStorage.getItem('lastLoginPassword')
      ]);

      if (!storedEmail || !storedPassword) {
        Alert.alert(
          'No Saved Credentials',
          'Please login with password first to enable biometric login'
        );
        setIsLoading(false);
        return;
      }

      // Authenticate with biometrics
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to login',
        fallbackLabel: 'Use password',
        disableDeviceFallback: true,
        cancelLabel: 'Cancel',
        requireAuthentication: true,
      });

      if (!result.success) {
        setIsLoading(false);
        return;
      }

      // Direct login without setting state
      try {
        // Check if admin credentials were entered
        if (storedEmail === 'admin@gmail.com' && storedPassword === '000000') {
          const { saveAdminAuthState } = await import('../utils/authState');
          await saveAdminAuthState();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          router.replace('/(admin)');
          return;
        }

        // Regular user login
        const response = await login(storedEmail, storedPassword);
        const { saveUserAuthState } = await import('../utils/authState');
        
        // Save user authentication state
        await saveUserAuthState(
          response.user.id.toString(),
          response.token
        );

        // Store credentials for biometric login if enabled
        if (isBiometricEnabled) {
          await AsyncStorage.setItem('lastLoginEmail', storedEmail);
          await AsyncStorage.setItem('lastLoginPassword', storedPassword);
        }

        // Success haptic feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // Navigate to dashboard
        router.replace('/(dashboard)');
      } catch (error: any) {
        console.error('Login error:', error);
        Alert.alert(
          'Error',
          error.message || 'Failed to login. Please try again.'
        );
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      Alert.alert('Error', 'Biometric authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const { width, height } = Dimensions.get('window');

  const validateForm = () => {
    let isValid = true;

    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email');
      isValid = false;
    } else {
      setEmailError('');
    }

    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);

    try {
      // Check if admin credentials were entered
      if (email === 'admin@gmail.com' && password === '000000') {
        // Import the auth state utility
        const { saveAdminAuthState } = await import('../utils/authState');

        // Save admin authentication state
        await saveAdminAuthState();

        // Success haptic feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Navigate to admin dashboard
        router.replace('/(admin)');
        return;
      }

      // Regular user login
      const response = await login(email, password);

      // Import the auth state utility
      const { saveUserAuthState } = await import('../utils/authState');

      // Save user authentication state
      await saveUserAuthState(
        response.user.id.toString(),
        response.token
      );

      // Store credentials for biometric login if enabled
      if (isBiometricEnabled) {
        await AsyncStorage.setItem('lastLoginEmail', email);
        await AsyncStorage.setItem('lastLoginPassword', password);
      }

      // Success haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Navigate to dashboard
      router.replace('/(dashboard)');
    } catch (error) {
      console.error('Login error:', error);

      // Error haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      Alert.alert(
        'Error',
        error.message || 'Failed to login. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowForgotPassword(true);
    // In a real app, you would implement password reset functionality here
    Alert.alert(
      'Reset Password',
      'Password reset functionality will be implemented in a future update.',
      [{ text: 'OK', onPress: () => setShowForgotPassword(false) }]
    );
  };

  const handleSignUp = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(auth)/SignupScreen');
  };

  const handleLoginPress = () => {
    buttonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1, { damping: 10, stiffness: 200 })
    );
    handleLogin();
  };

  const handleBiometricPress = () => {
    biometricScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1, { damping: 10, stiffness: 200 })
    );
    handleBiometricLogin();
  };

  const handleSocialPress = (platform: 'google' | 'facebook' | 'apple') => {
    socialButtonScales[platform].value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1, { damping: 10, stiffness: 200 })
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <Background variant="light">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            entering={FadeIn.duration(1000).springify()}
            style={styles.logoContainer}
          >
            <Logo size="large" />
            <Animated.Text
              entering={FadeInDown.delay(400).duration(800).springify()}
              style={styles.appName}
            >
              Nepal Disaster Management
            </Animated.Text>
            <Animated.Text
              entering={FadeInDown.delay(600).duration(800).springify()}
              style={styles.tagline}
            >
              Safety & Support in Times of Need
            </Animated.Text>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(800).duration(800).springify()}
            style={styles.formContainer}
          >
            <Animated.Text 
              entering={FadeInDown.delay(900).duration(600)}
              style={styles.title}
            >
              Login
            </Animated.Text>

            <AnimatedView 
              animation="slideInUp" 
              delay={1000} 
              duration={600}
              style={{ transform: [{ scale: 1 }] }}
            >
              <FormInput
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                error={emailError}
                leftIcon="mail-outline"
              />
            </AnimatedView>

            <AnimatedView 
              animation="slideInUp" 
              delay={1200} 
              duration={600}
              style={{ transform: [{ scale: 1 }] }}
            >
              <FormInput
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                error={passwordError}
                leftIcon="lock-closed-outline"
              />
            </AnimatedView>

            <AnimatedView 
              animation="fadeIn" 
              delay={1400} 
              duration={600}
            >
              <TouchableOpacity
                style={styles.forgotPasswordLink}
                onPress={handleForgotPassword}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </AnimatedView>

            <Animated.View 
              entering={FadeInUp.delay(1600).duration(600)}
              style={loginButtonStyle}
            >
              <Button
                title="Login"
                onPress={handleLoginPress}
                isLoading={isLoading}
                disabled={isLoading}
                type="primary"
                size="large"
                style={styles.loginButton}
              />
            </Animated.View>

            {isBiometricAvailable && (
              <Animated.View 
                entering={FadeIn.delay(1800).duration(600)}
                style={biometricButtonStyle}
              >
                <View style={styles.biometricContainer}>
                  <TouchableOpacity
                    style={styles.biometricButton}
                    onPress={handleBiometricPress}
                    disabled={isLoading}
                  >
                    <Ionicons
                      name={Platform.OS === 'ios' ? 'finger-print' : 'finger-print-outline'}
                      size={24}
                      color={colors.primary}
                    />
                    <Text style={styles.biometricButtonText}>
                      Login with Biometric
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.biometricToggle}
                    onPress={toggleBiometric}
                  >
                    <View style={[
                      styles.toggleSwitch,
                      isBiometricEnabled && styles.toggleSwitchActive
                    ]}>
                      <Animated.View 
                        style={[
                          styles.toggleKnob,
                          isBiometricEnabled && styles.toggleKnobActive
                        ]} 
                      />
                    </View>
                    <Text style={styles.biometricToggleText}>
                      Enable Biometric Login
                    </Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            )}

            <Animated.View 
              entering={FadeIn.delay(2000).duration(600)}
            >
              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.divider} />
              </View>
            </Animated.View>

            <Animated.View 
              entering={FadeInUp.delay(2200).duration(600)}
              style={styles.socialButtonsContainer}
            >
              <Animated.View style={socialButtonStyles.google}>
                <TouchableOpacity 
                  style={styles.socialButton}
                  onPress={() => handleSocialPress('google')}
                >
                  <Ionicons name="logo-google" size={24} color={colors.danger} />
                </TouchableOpacity>
              </Animated.View>
              
              <Animated.View style={socialButtonStyles.facebook}>
                <TouchableOpacity 
                  style={styles.socialButton}
                  onPress={() => handleSocialPress('facebook')}
                >
                  <Ionicons name="logo-facebook" size={24} color="#4267B2" />
                </TouchableOpacity>
              </Animated.View>
              
              <Animated.View style={socialButtonStyles.apple}>
                <TouchableOpacity 
                  style={styles.socialButton}
                  onPress={() => handleSocialPress('apple')}
                >
                  <Ionicons name="logo-apple" size={24} color="#000" />
                </TouchableOpacity>
              </Animated.View>
            </Animated.View>

            <Animated.View 
              entering={FadeIn.delay(2400).duration(600)}
            >
              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Don't have an account?</Text>
                <TouchableOpacity onPress={handleSignUp}>
                  <Text style={styles.signupLink}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Background>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  tagline: {
    fontSize: 16,
    color: colors.textLight,
    marginTop: 5,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontSize: 14,
  },
  loginButton: {
    marginTop: 20,
    marginBottom: 10,
    width: '100%',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.textLight,
    paddingHorizontal: 10,
    fontSize: 14,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    ...shadows.small,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  signupText: {
    color: '#666',
    fontSize: 16,
  },
  signupLink: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  biometricContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.small,
  },
  biometricButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  biometricToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  toggleSwitch: {
    width: 50,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.border,
    padding: 2,
  },
  toggleSwitchActive: {
    backgroundColor: colors.primary,
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    transform: [{ translateX: 0 }],
  },
  toggleKnobActive: {
    transform: [{ translateX: 26 }],
  },
  biometricToggleText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.textLight,
  },
});

export default LoginScreen;