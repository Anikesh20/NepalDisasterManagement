module.exports = {
  preset: 'react-native',
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  setupFiles: ['<rootDir>/jest.setup.js'],
  testMatch: ['**/?(*.)+(test).[jt]s?(x)'],
  transformIgnorePatterns: [
    'node_modules/(?!(expo|@expo|react-native|@react-native|@react-navigation|@unimodules|unimodules|native-base|@react-native-community|@react-native-picker|@react-native-masked-view|@react-native-async-storage|@react-native-firebase|@react-native-svg|lottie-react-native|moti|nativewind|expo-haptics|expo-modules-core|expo-constants|expo-device|expo-file-system|expo-font|expo-image|expo-image-picker|expo-linear-gradient|expo-local-authentication|expo-location|expo-navigation-bar|expo-notifications|expo-router|expo-screen-orientation|expo-sharing|expo-splash-screen|expo-status-bar|expo-symbols|expo-system-ui|expo-task-manager|expo-updates|expo-web-browser)/)',
  ],
  reporters: [
    "default",
    "jest-timing-reporter"
  ],
};