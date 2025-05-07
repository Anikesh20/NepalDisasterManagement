// Simplified theme for quick fixes
export const colors = {
  primary: '#FF5A5F',
  primaryDark: '#E04146',
  primaryLight: '#FF8A8F',
  secondary: '#3498DB',
  secondaryDark: '#2980B9',
  secondaryLight: '#5DADE2',
  accent: '#FFB400',
  success: '#2ECC71',
  warning: '#F39C12',
  danger: '#E74C3C',
  background: '#F9F9F9',
  card: '#FFFFFF',
  text: '#333333',
  textLight: '#666666',
  textDark: '#111111',
  border: '#E0E0E0',
  disabled: '#CCCCCC',
  placeholder: '#999999',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  fontWeights: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    black: '900',
  },
};

const themeSimple = {
  colors,
  shadows,
  spacing,
  typography,
};

export default themeSimple;
