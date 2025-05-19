import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import Background from '../components/Background';
import Button from '../components/Button';
import FormInput from '../components/FormInput';
import Logo from '../components/Logo';
import { bloodGroups } from '../data/bloodGroups';
import { districts } from '../data/districts';
import { signup } from '../services/authService';
import { colors, shadows, typography } from '../styles/theme-simple';

const SignupScreen = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    fullName: '',
    phoneNumber: '',
    emergencyNumber: '',
    district: '',
    currentLocation: '',
    bloodGroup: '',
    password: '',
    repeatPassword: '',
    isVolunteer: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isDistrictOpen, setIsDistrictOpen] = useState(false);
  const [isBloodGroupOpen, setIsBloodGroupOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const { width, height } = Dimensions.get('window');

  useEffect(() => {
    // Hide navigation bar when signup screen is shown
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

    // Get location
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required for better service');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      setFormData(prev => ({
        ...prev,
        currentLocation: `${location.coords.latitude}, ${location.coords.longitude}`
      }));
    })();
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!formData.email.endsWith('@gmail.com')) {
      newErrors.email = 'Please enter a valid Gmail address';
    }

    if (!formData.username) {
      newErrors.username = 'Username is required';
    }

    if (!formData.fullName) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^(98|97)\d{8}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must start with 98 or 97 and be 10 digits';
    }

    if (formData.emergencyNumber && !/^(98|97)\d{8}$/.test(formData.emergencyNumber)) {
      newErrors.emergencyNumber = 'Emergency number must start with 98 or 97 and be 10 digits';
    }

    if (!formData.district) {
      newErrors.district = 'District is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.repeatPassword) {
      newErrors.repeatPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCurrentStep = () => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!formData.email.endsWith('@gmail.com')) {
        newErrors.email = 'Please enter a valid Gmail address';
      }

      if (!formData.username) {
        newErrors.username = 'Username is required';
      }

      if (!formData.fullName) {
        newErrors.fullName = 'Full name is required';
      }
    }
    else if (currentStep === 2) {
      if (!formData.phoneNumber) {
        newErrors.phoneNumber = 'Phone number is required';
      } else if (!/^(98|97)\d{8}$/.test(formData.phoneNumber)) {
        newErrors.phoneNumber = 'Phone number must start with 98 or 97 and be 10 digits';
      }

      if (formData.emergencyNumber && !/^(98|97)\d{8}$/.test(formData.emergencyNumber)) {
        newErrors.emergencyNumber = 'Emergency number must start with 98 or 97 and be 10 digits';
      }

      if (!formData.district) {
        newErrors.district = 'District is required';
      }
    }
    else if (currentStep === 3) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }

      if (formData.password !== formData.repeatPassword) {
        newErrors.repeatPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevStep = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSignup = async () => {
    if (!validateCurrentStep()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);

    try {
      console.log('Sending signup data:', { ...formData, password: '***' });
      const response = await signup(formData);

      // Success haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Alert.alert(
        'Success',
        'Account created successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(auth)/LoginScreen')
          }
        ]
      );
    } catch (error: any) {
      console.error('Signup error:', error);

      // Error haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      Alert.alert(
        'Error',
        error.message || 'Failed to create account. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Define step titles and icons
  const steps = [
    { title: 'Basic Info', icon: 'person-outline', description: 'Tell us about yourself' },
    { title: 'Location & Contact', icon: 'location-outline', description: 'Where can we reach you?' },
    { title: 'Security', icon: 'shield-outline', description: 'Secure your account' }
  ];

  // Render step indicators
  const renderStepIndicators = () => {
    return (
      <View style={styles.stepsContainer}>
        {steps.map((step, index) => (
          <View key={index} style={styles.stepIndicatorWrapper}>
            <TouchableOpacity
              style={[
                styles.stepIndicator,
                currentStep > index && styles.completedStep,
                currentStep === index + 1 && styles.activeStep
              ]}
              onPress={() => {
                // Only allow going back to previous steps
                if (index < currentStep - 1) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setCurrentStep(index + 1);
                }
              }}
            >
              {currentStep > index ? (
                <Ionicons name="checkmark" size={20} color="#fff" />
              ) : (
                <Ionicons name={step.icon} size={20} color={currentStep === index + 1 ? '#fff' : colors.textLight} />
              )}
            </TouchableOpacity>
            <Text style={[
              styles.stepTitle,
              currentStep === index + 1 && styles.activeStepTitle
            ]}>
              {step.title}
            </Text>
            {index < steps.length - 1 && (
              <View style={[
                styles.stepConnector,
                currentStep > index + 1 && styles.completedConnector
              ]} />
            )}
          </View>
        ))}
      </View>
    );
  };

  // Render current step description
  const renderStepDescription = () => {
    const currentStepInfo = steps[currentStep - 1];
    return (
      <Animated.View
        entering={FadeIn.duration(500)}
        style={styles.stepDescriptionContainer}
      >
        <Text style={styles.stepDescriptionTitle}>{currentStepInfo.title}</Text>
        <Text style={styles.stepDescriptionText}>{currentStepInfo.description}</Text>
      </Animated.View>
    );
  };

  // Render form based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Animated.View entering={FadeInUp.duration(500)}>
            <FormInput
              label="Email"
              placeholder="Enter your email"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              leftIcon="mail-outline"
            />

            <FormInput
              label="Username"
              placeholder="Choose a username"
              value={formData.username}
              onChangeText={(text) => setFormData({ ...formData, username: text })}
              autoCapitalize="none"
              error={errors.username}
              leftIcon="person-outline"
            />

            <FormInput
              label="Full Name"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChangeText={(text) => setFormData({ ...formData, fullName: text })}
              error={errors.fullName}
              leftIcon="text-outline"
            />
          </Animated.View>
        );
      case 2:
        return (
          <Animated.View entering={FadeInUp.duration(500)}>
            <FormInput
              label="Phone Number"
              placeholder="Enter your phone number"
              value={formData.phoneNumber}
              onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
              keyboardType="phone-pad"
              error={errors.phoneNumber}
              leftIcon="call-outline"
            />

            <FormInput
              label="Emergency Number (Optional)"
              placeholder="Enter emergency contact number"
              value={formData.emergencyNumber}
              onChangeText={(text) => setFormData({ ...formData, emergencyNumber: text })}
              keyboardType="phone-pad"
              error={errors.emergencyNumber}
              leftIcon="alert-circle-outline"
            />

            <View style={styles.pickerContainer}>
              <Text style={styles.inputLabel}>District</Text>
              <TouchableOpacity
                style={styles.collapsibleHeader}
                onPress={() => setIsDistrictOpen(!isDistrictOpen)}
              >
                <Text style={[
                  styles.pickerText,
                  !formData.district && styles.placeholderText
                ]}>
                  {formData.district || "Select your district"}
                </Text>
                <Ionicons
                  name={isDistrictOpen ? 'chevron-up' : 'chevron-down'}
                  size={24}
                  color={colors.textLight}
                />
              </TouchableOpacity>
              {isDistrictOpen && (
                <Animated.View
                  entering={FadeInDown.duration(300)}
                  style={styles.dropdownContainer}
                >
                  <ScrollView style={styles.verticalList} nestedScrollEnabled>
                    {districts.map((district) => (
                      <TouchableOpacity
                        key={district}
                        style={[
                          styles.verticalItem,
                          formData.district === district && styles.selectedItem,
                        ]}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setFormData({ ...formData, district });
                          setIsDistrictOpen(false);
                        }}
                      >
                        <Text style={[
                          styles.verticalItemText,
                          formData.district === district && styles.selectedItemText
                        ]}>{district}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </Animated.View>
              )}
              {errors.district && <Text style={styles.errorText}>{errors.district}</Text>}
            </View>

            <FormInput
              label="Current Location"
              placeholder="Your location will be auto-tracked"
              value={formData.currentLocation}
              editable={false}
              leftIcon="location-outline"
            />

            <View style={styles.pickerContainer}>
              <Text style={styles.inputLabel}>Blood Group (Optional)</Text>
              <TouchableOpacity
                style={styles.collapsibleHeader}
                onPress={() => setIsBloodGroupOpen(!isBloodGroupOpen)}
              >
                <Text style={[
                  styles.pickerText,
                  !formData.bloodGroup && styles.placeholderText
                ]}>
                  {formData.bloodGroup || "Select your blood group"}
                </Text>
                <Ionicons
                  name={isBloodGroupOpen ? 'chevron-up' : 'chevron-down'}
                  size={24}
                  color={colors.textLight}
                />
              </TouchableOpacity>
              {isBloodGroupOpen && (
                <Animated.View
                  entering={FadeInDown.duration(300)}
                  style={styles.dropdownContainer}
                >
                  <View style={styles.bloodGroupGrid}>
                    {bloodGroups.map((group) => (
                      <TouchableOpacity
                        key={group}
                        style={[
                          styles.bloodGroupItem,
                          formData.bloodGroup === group && styles.selectedBloodGroup,
                        ]}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setFormData({ ...formData, bloodGroup: group });
                          setIsBloodGroupOpen(false);
                        }}
                      >
                        <Text style={[
                          styles.bloodGroupText,
                          formData.bloodGroup === group && styles.selectedBloodGroupText
                        ]}>{group}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </Animated.View>
              )}
            </View>
          </Animated.View>
        );
      case 3:
        return (
          <Animated.View entering={FadeInUp.duration(500)}>
            <FormInput
              label="Password"
              placeholder="Enter your password"
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              secureTextEntry
              error={errors.password}
              leftIcon="lock-closed-outline"
            />

            <FormInput
              label="Repeat Password"
              placeholder="Repeat your password"
              value={formData.repeatPassword}
              onChangeText={(text) => setFormData({ ...formData, repeatPassword: text })}
              secureTextEntry
              error={errors.repeatPassword}
              leftIcon="lock-closed-outline"
            />

            <View style={styles.volunteerContainer}>
              <Text style={styles.volunteerTitle}>Volunteer Registration</Text>
              <Text style={styles.volunteerDescription}>
                Register as a volunteer to help others during disasters. You'll be notified when help is needed in your area.
              </Text>

              <View style={styles.checkboxContainer}>
                <TouchableOpacity
                  style={[styles.checkbox, formData.isVolunteer && styles.checked]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setFormData({ ...formData, isVolunteer: !formData.isVolunteer });
                  }}
                >
                  {formData.isVolunteer && <Ionicons name="checkmark" size={20} color="#fff" />}
                </TouchableOpacity>
                <Text style={styles.checkboxLabel}>I want to register as a volunteer</Text>
              </View>
            </View>
          </Animated.View>
        );
      default:
        return null;
    }
  };

  // Render navigation buttons
  const renderNavButtons = () => {
    return (
      <View style={styles.navButtonsContainer}>
        {currentStep > 1 && (
          <Button
            title="Back"
            onPress={handlePrevStep}
            type="outline"
            size="large"
            style={styles.navButton}
          />
        )}

        {currentStep < totalSteps ? (
          <Button
            title="Next"
            onPress={handleNextStep}
            type="primary"
            size="large"
            style={[styles.navButton, currentStep === 1 && styles.singleButton]}
          />
        ) : (
          <Button
            title="Create Account"
            onPress={handleSignup}
            type="primary"
            size="large"
            isLoading={isLoading}
            disabled={isLoading}
            style={[styles.navButton, currentStep === 1 && styles.singleButton]}
          />
        )}
      </View>
    );
  };

  return (
    <Background variant="light">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.mainContainer}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            entering={FadeIn.duration(800)}
            style={styles.logoContainer}
          >
            <Logo size="small" />
          </Animated.View>

          <Text style={styles.title}>Create Account</Text>

          {renderStepIndicators()}
          {renderStepDescription()}

          <Animated.View
            entering={FadeIn.delay(300).duration(500)}
            style={styles.formContainer}
          >
            {renderStepContent()}
            {renderNavButtons()}
          </Animated.View>
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account?</Text>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.replace('/(auth)/LoginScreen');
              }}
            >
              <Text style={styles.loginLink}>Login here</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Background>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  title: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold as any,
    marginBottom: 20,
    textAlign: 'center',
    color: colors.primary,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
    ...shadows.small,
  },
  // Step indicators
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  stepIndicatorWrapper: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  stepIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    ...shadows.small,
  },
  activeStep: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  completedStep: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  stepTitle: {
    fontSize: typography.fontSizes.xs,
    color: colors.textLight,
    textAlign: 'center',
    fontWeight: typography.fontWeights.medium as any,
  },
  activeStepTitle: {
    color: colors.primary,
    fontWeight: typography.fontWeights.bold as any,
  },
  stepConnector: {
    position: 'absolute',
    top: 20,
    right: -50 + '%',
    width: 100 + '%',
    height: 2,
    backgroundColor: colors.border,
    zIndex: -1,
  },
  completedConnector: {
    backgroundColor: colors.success,
  },
  // Step description
  stepDescriptionContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    ...shadows.small,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  stepDescriptionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold as any,
    color: colors.primary,
    marginBottom: 5,
  },
  stepDescriptionText: {
    fontSize: typography.fontSizes.md,
    color: colors.textLight,
  },
  // Form container
  formContainer: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    ...shadows.medium,
    marginBottom: 20,
  },
  // Picker styles
  pickerContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: typography.fontSizes.sm,
    marginBottom: 6,
    fontWeight: typography.fontWeights.medium as any,
    color: colors.text,
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.card,
  },
  pickerText: {
    fontSize: typography.fontSizes.md,
    color: colors.text,
  },
  placeholderText: {
    color: colors.placeholder,
  },
  dropdownContainer: {
    marginTop: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    ...shadows.small,
    overflow: 'hidden',
  },
  verticalList: {
    maxHeight: 200,
  },
  verticalItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  verticalItemText: {
    fontSize: typography.fontSizes.md,
    color: colors.text,
  },
  selectedItem: {
    backgroundColor: colors.primary,
  },
  selectedItemText: {
    color: colors.card,
    fontWeight: typography.fontWeights.bold as any,
  },
  // Blood group grid
  bloodGroupGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  bloodGroupItem: {
    width: '25%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    margin: '4%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedBloodGroup: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  bloodGroupText: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold as any,
    color: colors.text,
  },
  selectedBloodGroupText: {
    color: colors.card,
  },
  // Volunteer section
  volunteerContainer: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 15,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  volunteerTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold as any,
    color: colors.text,
    marginBottom: 8,
  },
  volunteerDescription: {
    fontSize: typography.fontSizes.sm,
    color: colors.textLight,
    marginBottom: 15,
    lineHeight: 20,
  },
  // Checkbox
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.small,
  },
  checked: {
    backgroundColor: colors.primary,
  },
  checkboxLabel: {
    fontSize: typography.fontSizes.md,
    color: colors.text,
    fontWeight: typography.fontWeights.medium as any,
  },
  // Error text
  errorText: {
    color: colors.danger,
    fontSize: typography.fontSizes.xs,
    marginTop: 5,
    marginLeft: 5,
  },
  // Navigation buttons
  navButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  navButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  singleButton: {
    marginHorizontal: 0,
  },
  // Login link
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  loginText: {
    fontSize: typography.fontSizes.md,
    color: colors.textLight,
  },
  loginLink: {
    fontSize: typography.fontSizes.md,
    color: colors.primary,
    fontWeight: typography.fontWeights.bold as any,
    textDecorationLine: 'underline',
  },
});

export default SignupScreen;