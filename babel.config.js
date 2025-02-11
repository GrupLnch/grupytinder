module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "@babel/preset-typescript",
      ["@babel/preset-react", { runtime: "automatic" }],
      "nativewind/babel"
    ],
    plugins: [
      "@babel/plugin-transform-runtime",
      [
        "module-resolver", {
        root: ["./"],
        alias: {
          "screens": "./screens",
          "components": "./components",
          "hooks": "./hooks"
        }
      }
      ]
    ],
    env: {
      test: {
        plugins: ["@babel/plugin-transform-runtime"]
      }
    }
  };
};
