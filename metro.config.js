const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

// Get the default config
const config = getDefaultConfig(__dirname);

// Apply NativeWind with the correct configuration
module.exports = withNativeWind(config, {
  input: './global.css',
  // Add these additional options if needed
  projectRoot: __dirname,
  watchFolders: [__dirname],
});