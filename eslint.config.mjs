import nextConfig from "eslint-config-next";

/** @type {import('eslint').Linter.FlatConfig[]} */
const eslintConfig = [
  // Ignore patterns must be in a separate config object
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/build/**",
      "**/out/**",
      "**/*.min.js",
      "**/coverage/**",
    ],
  },
  ...nextConfig,
  {
    rules: {
      // Disable overly strict React hooks rules that cause false positives
      // with valid React 19 patterns
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/set-state-in-render": "off",
      // Allow calling async functions in useEffect with void operator
      "@next/next/no-assign-module-variable": "off",
    },
  },
];

export default eslintConfig;
