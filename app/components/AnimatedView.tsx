import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming,
} from 'react-native-reanimated';

type AnimationType = 'fadeIn' | 'slideInUp' | 'slideInLeft' | 'slideInRight' | 'zoomIn';

interface AnimatedViewProps {
  children: React.ReactNode;
  animation: AnimationType;
  delay?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
}

const AnimatedView: React.FC<AnimatedViewProps> = ({
  children,
  animation,
  delay = 0,
  duration = 500,
  style,
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);
  const translateX = useSharedValue(50);
  const scale = useSharedValue(0.8);

  // Initialize animations without useEffect
  opacity.value = withDelay(
    delay,
    withTiming(1, { duration, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })
  );

  if (animation === 'slideInUp' || animation === 'slideInLeft' || animation === 'slideInRight') {
    translateY.value = withDelay(
      delay,
      withTiming(0, { duration, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })
    );
    translateX.value = withDelay(
      delay,
      withTiming(0, { duration, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })
    );
  }

  if (animation === 'zoomIn') {
    scale.value = withDelay(
      delay,
      withTiming(1, { duration, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })
    );
  }

  const animatedStyle = useAnimatedStyle(() => {
    let animStyle = {
      opacity: opacity.value,
    };

    switch (animation) {
      case 'fadeIn':
        return animStyle;
      case 'slideInUp':
        return {
          ...animStyle,
          transform: [{ translateY: translateY.value }],
        };
      case 'slideInLeft':
        return {
          ...animStyle,
          transform: [{ translateX: -translateX.value }],
        };
      case 'slideInRight':
        return {
          ...animStyle,
          transform: [{ translateX: translateX.value }],
        };
      case 'zoomIn':
        return {
          ...animStyle,
          transform: [{ scale: scale.value }],
        };
      default:
        return animStyle;
    }
  });

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
};

export default AnimatedView;
