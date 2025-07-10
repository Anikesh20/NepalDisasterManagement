const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Block test files and __tests__ directories from being bundled
const exclusionList = require('metro-config/src/defaults/exclusionList');
config.resolver.blockList = exclusionList([
  /.*\.test\.js$/,
  /.*\.test\.ts$/,
  /.*\.test\.tsx$/,
  /__tests__\/.*/,
  /__tsnapshots__\/.*/
]);

module.exports = withNativeWind(config, { 
  input: './global.css',
  inlineRem: 16,
}); 