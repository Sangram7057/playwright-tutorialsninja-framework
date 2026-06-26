// @ts-check
/**
 * ESLint flat configuration (ESLint v9+).
 *
 * Goal: enforce a consistent, type-aware style for the whole framework and
 * surface common Playwright/TypeScript mistakes early. Prettier owns pure
 * formatting; ESLint owns code-quality rules (the two are kept from fighting
 * via `eslint-config-prettier`).
 */
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  // Files/folders ESLint should never touch.
  {
    ignores: [
      'node_modules/**',
      'reports/**',
      'test-results/**',
      'playwright-report/**',
      'allure-results/**',
      'allure-report/**',
    ],
  },

  // Base recommended rule sets.
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Project-wide language + rule customisation.
  {
    files: ['**/*.ts'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // Encourage explicit, intentional code.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': [
        'warn',
        { allowExpressions: true },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'always'],
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },

  // Node scripts (.mjs) — provide Node globals (process, console, …).
  {
    files: ['**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
  },

  // Disable formatting rules that conflict with Prettier (keep last).
  prettierConfig,
);
