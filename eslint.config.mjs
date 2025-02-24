import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["**/*.{js,mjs,cjs,jsx,ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node, // Add Node.js globals (fixes "module is not defined")
        ...globals.jest // Fixes Jest-related errors (describe, it, expect)
      },
      ecmaVersion: "latest",
      sourceType: "module"
    },
    plugins: {
      react: pluginReact
    },
    rules: {
      "no-undef": "off", // Disable "module is not defined" errors
      "react/prop-types": "off" // Optional: Disable prop-types enforcement
    },
    extends: [
      pluginJs.configs.recommended,
      pluginReact.configs.recommended
    ]
  }
];
