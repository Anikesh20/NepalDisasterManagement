import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    StyleProp,
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import Animated, {
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { colors, shadows, typography } from '../styles/theme-simple';

// Define borderRadius locally since it's not in the simplified theme
const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999,
};

interface FormInputProps extends TextInputProps {
  label: string;
  error?: string;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputStyle,
  labelStyle,
  secureTextEntry,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  // Animation values
  const focusAnim = useSharedValue(0);

  // Update animation value when focus changes - without useEffect
  if (isFocused) {
    focusAnim.value = withTiming(1, { duration: 150 });
  } else {
    focusAnim.value = withTiming(0, { duration: 150 });
  }

  // Animated styles
  const borderStyle = useAnimatedStyle(() => {
    let borderColor;

    if (error) {
      borderColor = colors.danger;
    } else {
      borderColor = interpolateColor(
        focusAnim.value,
        [0, 1],
        [colors.border, colors.primary]
      );
    }

    return {
      borderColor,
    };
  });

  const labelStyle2 = useAnimatedStyle(() => {
    const color = error
      ? colors.danger
      : interpolateColor(
          focusAnim.value,
          [0, 1],
          [colors.textLight, colors.primary]
        );

    return {
      color,
    };
  });

  const handlePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <Animated.Text style={[styles.label, labelStyle2, labelStyle]}>
        {label}
      </Animated.Text>

      <Animated.View style={[styles.inputContainer, borderStyle, shadows.small]}>
        {leftIcon && (
          <Ionicons
            name={leftIcon as any}
            size={20}
            color={error ? colors.danger : isFocused ? colors.primary : colors.textLight}
            style={styles.leftIcon}
          />
        )}

        <TextInput
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            (rightIcon || secureTextEntry) && styles.inputWithRightIcon,
            inputStyle,
          ]}
          placeholderTextColor={colors.placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={secureTextEntry ? !isPasswordVisible : false}
          {...props}
        />

        {secureTextEntry && (
          <TouchableOpacity
            style={styles.rightIcon}
            onPress={handlePasswordVisibility}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.textLight}
            />
          </TouchableOpacity>
        )}

        {rightIcon && !secureTextEntry && (
          <TouchableOpacity
            style={styles.rightIcon}
            onPress={onRightIconPress}
          >
            <Ionicons
              name={rightIcon as any}
              size={20}
              color={error ? colors.danger : isFocused ? colors.primary : colors.textLight}
            />
          </TouchableOpacity>
        )}
      </Animated.View>

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={16} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: typography.fontSizes.sm,
    marginBottom: 6,
    fontWeight: typography.fontWeights.medium as any,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: borderRadius.md,
    backgroundColor: colors.card,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: typography.fontSizes.md,
    color: colors.text,
  },
  inputWithLeftIcon: {
    paddingLeft: 8,
  },
  inputWithRightIcon: {
    paddingRight: 8,
  },
  leftIcon: {
    marginLeft: 12,
  },
  rightIcon: {
    padding: 8,
    marginRight: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  errorText: {
    marginLeft: 4,
    fontSize: typography.fontSizes.xs,
    color: colors.danger,
  },
});

export default FormInput;
