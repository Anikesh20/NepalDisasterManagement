import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, shadows } from '../styles/theme';

interface ALogoHeaderProps {
  size?: 'small' | 'medium' | 'large';
}

const ALogoHeader: React.FC<ALogoHeaderProps> = ({ size = 'medium' }) => {
  const getSize = () => {
    switch (size) {
      case 'small':
        return 36;
      case 'large':
        return 64;
      default:
        return 48;
    }
  };

  const logoSize = getSize();
  const iconSize = logoSize * 0.5;

  return (
    <View style={[styles.container, { width: logoSize, height: logoSize }]}>
      <LinearGradient
        colors={['#FF5A5F', '#FF8A8F']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, { width: logoSize, height: logoSize }]}
      >
        <Text style={[styles.logoText, { fontSize: logoSize * 0.6 }]}>A</Text>
      </LinearGradient>
      <View style={[styles.iconBadge, { right: -logoSize * 0.15, bottom: -logoSize * 0.05 }]}>
        <Ionicons name="shield-checkmark" size={iconSize} color="#fff" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'visible',
    position: 'relative',
  },
  gradient: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    ...shadows.medium,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  logoText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  iconBadge: {
    position: 'absolute',
    backgroundColor: colors.accent,
    borderRadius: 999,
    padding: 2,
    ...shadows.small,
    borderWidth: 1.5,
    borderColor: '#fff',
  }
});

export default ALogoHeader;
