module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",  // Main app entry point
    "./src/**/*.{js,jsx,ts,tsx}" // All files in the src folder
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  corePlugins: require('tailwind-rn/unsupported-core-plugins'),
};
