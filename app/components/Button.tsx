import * as Haptics from 'expo-haptics';
import React from 'react';
import {
    ActivityIndicator,
    StyleProp,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    ViewStyle,
} from 'react-native';
import { colors, shadows, typography } from '../styles/theme-simple';

// Define gradients and borderRadius locally since they're not in the simplified theme
const gradients = {
  primary: [colors.primary, colors.primaryLight],
  secondary: [colors.secondary, colors.secondaryLight],
};

const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999,
};

interface ButtonProps {
  title: string;
  onPress: () => void;
  type?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  type = 'primary',
  size = 'medium',
  isLoading = false,
  disabled = false,
  style,
  textStyle,
  leftIcon,
  rightIcon,
}) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const getButtonStyles = () => {
    let buttonStyles: StyleProp<ViewStyle> = [styles.button];

    // Add size styles
    switch (size) {
      case 'small':
        buttonStyles.push(styles.buttonSmall);
        break;
      case 'large':
        buttonStyles.push(styles.buttonLarge);
        break;
      default:
        buttonStyles.push(styles.buttonMedium);
    }

    // Add type-specific styles
    switch (type) {
      case 'secondary':
        buttonStyles.push(styles.buttonSecondary);
        break;
      case 'outline':
        buttonStyles.push(styles.buttonOutline);
        break;
      case 'text':
        buttonStyles.push(styles.buttonText);
        break;
      default:
        buttonStyles.push(styles.buttonPrimary);
    }

    // Add disabled styles
    if (disabled || isLoading) {
      buttonStyles.push(styles.buttonDisabled);
    }

    return buttonStyles;
  };

  const getTextStyles = () => {
    let textStyles: StyleProp<TextStyle> = [styles.buttonLabel];

    // Add size-specific text styles
    switch (size) {
      case 'small':
        textStyles.push(styles.buttonLabelSmall);
        break;
      case 'large':
        textStyles.push(styles.buttonLabelLarge);
        break;
      default:
        textStyles.push(styles.buttonLabelMedium);
    }

    // Add type-specific text styles
    switch (type) {
      case 'outline':
        textStyles.push(styles.buttonLabelOutline);
        break;
      case 'text':
        textStyles.push(styles.buttonLabelText);
        break;
      default:
        textStyles.push(styles.buttonLabelPrimary);
    }

    // Add disabled text styles
    if (disabled) {
      textStyles.push(styles.buttonLabelDisabled);
    }

    return textStyles;
  };

  // We'll use solid colors for all buttons for a cleaner look
  // Removed gradient implementation

  // For non-gradient buttons (outline, text, disabled)
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={disabled || isLoading}
      style={[getButtonStyles(), type === 'outline' ? shadows.small : null, style]}
    >
      {isLoading ? (
        <ActivityIndicator color={type === 'outline' || type === 'text' ? colors.primary : '#fff'} size="small" />
      ) : (
        <>
          {leftIcon && <>{leftIcon}</>}
          <Text style={[getTextStyles(), textStyle]}>{title}</Text>
          {rightIcon && <>{rightIcon}</>}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonSmall: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  buttonMedium: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  buttonLarge: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
    ...shadows.small,
  },
  buttonSecondary: {
    backgroundColor: colors.secondary,
    ...shadows.small,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  buttonText: {
    backgroundColor: 'transparent',
  },
  buttonDisabled: {
    backgroundColor: colors.disabled,
    borderColor: colors.disabled,
  },
  gradient: {
    flex: 1,
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.md,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonLabel: {
    fontWeight: typography.fontWeights.semibold as any,
    textAlign: 'center',
  },
  buttonLabelSmall: {
    fontSize: typography.fontSizes.sm,
  },
  buttonLabelMedium: {
    fontSize: typography.fontSizes.md,
  },
  buttonLabelLarge: {
    fontSize: typography.fontSizes.lg,
  },
  buttonLabelPrimary: {
    color: '#fff',
  },
  buttonLabelOutline: {
    color: colors.primary,
  },
  buttonLabelText: {
    color: colors.primary,
  },
  buttonLabelDisabled: {
    color: '#fff',
  },
});

export default Button;
