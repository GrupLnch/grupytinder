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
        ...globals.node, // Adds Node.js globals
        ...globals.jest  // Fixes Jest-related errors (describe, it, expect)
      },
    },
    plugins: {
      react
    },
    rules: {
      "no-undef": "off", // Prevents "module is not defined" errors
      "react/prop-types": "off", // Optional: Disable prop-types enforcement
    },
    ...js.configs.recommended,  // Instead of "extends", include the recommended configs
    ...react.configs.recommended,
  }
];
