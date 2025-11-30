import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

/**
 * ESLint Flat Config
 * - Parses TS/JS with TypeScript ESLint parser.
 * - Flags unused imports (error) and unused variables (warn).
 * - Enables React and Hooks recommended checks.
 */
export default [
  { ignores: ['dist'] },
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      parser: (await import("@typescript-eslint/parser")).default,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: "module",
        // Uncomment for type-aware rules (slower):
        // project: "./tsconfig.json",
        // tsconfigRootDir: new URL(".", import.meta.url).pathname,
      },
    },
    plugins: {
      "@typescript-eslint": (await import("@typescript-eslint/eslint-plugin")).default,
      import: (await import("eslint-plugin-import")).default,
      react: (await import("eslint-plugin-react")).default,
      "react-hooks": (await import("eslint-plugin-react-hooks")).default,
      "unused-imports": (await import("eslint-plugin-unused-imports")).default,
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      // Turn off base rule to avoid duplicate reports with TS rule
      "no-unused-vars": "off",

      // Unused variables (warn). Prefix args/vars with '_' to ignore when intentional.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", ignoreRestSiblings: true }
      ],

      // Unused imports (error)
      "unused-imports/no-unused-imports": "error",

      // Also catch unused variables via plugin (useful on JS files)
      "unused-imports/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
      ],

      // React modern JSX transform doesn’t need React in scope
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
    },
  },
]
