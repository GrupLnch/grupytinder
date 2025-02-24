import globals from "globals";
import js from "@eslint/js";
import react from "eslint-plugin-react";

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    files: ["**/*.{js,mjs,cjs,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest
      },
    },
    plugins: {
      react: react,
    },
    rules: {
      "no-undef": "off",
      "react/prop-types": "off",
    },
    ...js.configs.recommended,
    ...react.configs.recommended,
  }
];
