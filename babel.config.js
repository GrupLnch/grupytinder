
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // Add only essential plugins
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            screens: "./screens",
            components: "./components",
            hooks: "./hooks",
          },
        },
      ],
      "react-native-reanimated/plugin",
    ],
  };
};