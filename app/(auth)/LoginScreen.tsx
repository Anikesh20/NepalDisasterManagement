import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
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

      // Success haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Navigate to dashboard
      router.replace('/(dashboard)');
    } catch (error: any) {
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
            entering={FadeIn.duration(800)}
            style={styles.logoContainer}
          >
            <Logo size="large" />
            <Animated.Text
              entering={FadeInDown.delay(400).duration(800)}
              style={styles.appName}
            >
              Nepal Disaster Management
            </Animated.Text>
            <Animated.Text
              entering={FadeInDown.delay(600).duration(800)}
              style={styles.tagline}
            >
              Safety & Support in Times of Need
            </Animated.Text>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(800).duration(800)}
            style={styles.formContainer}
          >
            <Text style={styles.title}>Login</Text>

            <AnimatedView animation="slideInUp" delay={200} duration={800}>
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

            <AnimatedView animation="slideInUp" delay={400} duration={800}>
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

            <AnimatedView animation="fadeIn" delay={600} duration={800}>
              <TouchableOpacity
                style={styles.forgotPasswordLink}
                onPress={handleForgotPassword}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </AnimatedView>

            <AnimatedView animation="slideInUp" delay={800} duration={800}>
              <Button
                title="Login"
                onPress={handleLogin}
                isLoading={isLoading}
                disabled={isLoading}
                type="primary"
                size="large"
                style={styles.loginButton}
              />
            </AnimatedView>

            <AnimatedView animation="fadeIn" delay={1000} duration={800}>
              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.divider} />
              </View>
            </AnimatedView>

            <AnimatedView animation="slideInUp" delay={1200} duration={800}>
              <View style={styles.socialButtonsContainer}>
                <TouchableOpacity style={styles.socialButton}>
                  <Ionicons name="logo-google" size={24} color={colors.danger} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton}>
                  <Ionicons name="logo-facebook" size={24} color="#4267B2" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton}>
                  <Ionicons name="logo-apple" size={24} color="#000" />
                </TouchableOpacity>
              </View>
            </AnimatedView>

            <AnimatedView animation="fadeIn" delay={1400} duration={800}>
              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Don't have an account?</Text>
                <TouchableOpacity onPress={handleSignUp}>
                  <Text style={styles.signupLink}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </AnimatedView>


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

});

export default LoginScreen;