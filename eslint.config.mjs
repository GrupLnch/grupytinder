import js from "@eslint/js";
import react from "eslint-plugin-react";
import globals from "globals";

react.configs.recommended.plugins = { react };
react.configs.recommended.languageOptions = {
  parserOptions: react.configs.recommended.parserOptions,
};
delete react.configs.recommended.parserOptions;

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  js.configs.recommended,
  react.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,jsx,ts,tsx}"],
    ignores: ["coverage/**"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
      },
    },
    plugins: {
      react,
    },

    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "no-undef": "off",
      "react/prop-types": "off",
    },
  },
];