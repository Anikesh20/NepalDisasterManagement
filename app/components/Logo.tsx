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

  return (
    <View
      style={[
        styles.container,
        withShadow && shadows.medium,
        { width: getSize(), height: getSize() },
        style,
      ]}
    >
      <Image
        source={require('../../assets/images/icon.png')}
        style={[styles.image, { width: getSize(), height: getSize() }, imageStyle]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default Logo;
