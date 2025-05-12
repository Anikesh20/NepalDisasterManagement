import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, ImageStyle, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { shadows } from '../styles/theme-simple';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  withShadow?: boolean;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
}

const Logo: React.FC<LogoProps> = ({
  size = 'medium',
  withShadow = true,
  style,
  imageStyle,
}) => {
  const getSize = () => {
    switch (size) {
      case 'small':
        return 80;
      case 'large':
        return 160;
      default:
        return 120;
    }
  };

  const sizeValue = getSize();

  return (
    <View
      style={[
        styles.container,
        withShadow && shadows.medium,
        { width: sizeValue, height: sizeValue },
        style,
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
              style={[styles.image, imageStyle]}
              resizeMode="cover"
            />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
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

export default Logo;
