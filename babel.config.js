module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["@babel/preset-typescript"],
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      ["@babel/preset-react", { runtime: "automatic" }],
      "nativewind/babel",
    ],
    plugins: [
      "@babel/plugin-transform-runtime",
      [
        "module-resolver",
        {
          root: ["<rootDir>"],
          alias: {
            screens: "<rootDir>/screens",
            components: "<rootDir>/components",
            hooks: "<rootDir>/hooks",
          },
        },
      ],
      [
        "module:react-native-dotenv",
        {
          moduleName: "@env",
          path: ".env",
          blocklist: null,
          allowlist: null,
          safe: false,
          allowUndefined: true,
        },
      ],
    ],
    env: {
      test: {
        presets: [
          [
            "@babel/preset-env",
            { modules: "commonjs", targets: { node: "current" } },
          ],
        ],
        plugins: ["@babel/plugin-transform-runtime"],
      },
    },
  };
};