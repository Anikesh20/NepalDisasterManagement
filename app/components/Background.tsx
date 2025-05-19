import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { colors } from '../styles/theme-simple';

interface BackgroundProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'primary' | 'secondary' | 'light';
  withPattern?: boolean;
}

const Background: React.FC<BackgroundProps> = ({
  children,
  style,
  variant = 'primary',
  withPattern = true,
}) => {
  const getGradientColors = () => {
    switch (variant) {
      case 'secondary':
        return [colors.secondary, colors.secondaryDark];
      case 'light':
        return ['#FFFFFF', '#F5F5F5'];
      default:
        return [colors.primary, colors.primaryDark];
    }
  };

  return (
    <LinearGradient
      colors={getGradientColors()}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[styles.gradient, style]}
    >
      {withPattern && (
        <View style={styles.patternOverlay} pointerEvents="none" />
      )}
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    width: '100%',
  },
  patternOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.05,
    backgroundColor: 'transparent',
    // Note: React Native doesn't support CSS background patterns
    // We'll use a simple opacity overlay instead
  },
});

export default Background;
