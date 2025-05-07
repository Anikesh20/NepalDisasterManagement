// Theme colors and styles for the app
export const colors = {
  primary: '#FF5A5F', // Vibrant red - main brand color
  primaryDark: '#E04146', // Darker shade of primary
  primaryLight: '#FF8A8F', // Lighter shade of primary
  secondary: '#3498DB', // Vibrant blue - secondary color
  secondaryDark: '#2980B9', // Darker shade of secondary
  secondaryLight: '#5DADE2', // Lighter shade of secondary
  accent: '#FFB400', // Vibrant yellow/gold - accent color
  success: '#2ECC71', // Green for success states
  warning: '#F39C12', // Orange for warning states
  danger: '#E74C3C', // Red for error/danger states
  background: '#F9F9F9', // Light background
  card: '#FFFFFF', // Card background
  text: '#333333', // Primary text color
  textLight: '#666666', // Secondary text color
  textDark: '#111111', // Dark text for emphasis
  border: '#E0E0E0', // Border color
  disabled: '#CCCCCC', // Disabled state color
  placeholder: '#999999', // Placeholder text color
  overlay: 'rgba(0, 0, 0, 0.5)', // Overlay color for modals
};

export const gradients = {
  primary: ['#FF5A5F', '#FF8A8F'],
  secondary: ['#3498DB', '#5DADE2'],
  accent: ['#FFB400', '#FFCE54'],
  success: ['#2ECC71', '#4CD484'],
  danger: ['#E74C3C', '#FF6B6B'],
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
  large: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 7,
    elevation: 8,
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

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999,
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

const theme = {
  colors,
  gradients,
};

export default theme;
