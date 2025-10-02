module.exports = {
  extends: ['eslint:recommended'],
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  ignorePatterns: [
    'dist/',
    'build/',
    'node_modules/',
    'android/',
    'ios/',
    '*.config.js',
    '*.config.ts',
  ],
  rules: {
    'no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
    'no-console': 'warn',
  },
  overrides: [
    {
      files: ['apps/api/**/*.ts'],
      extends: ['eslint:recommended'],
      parser: '@typescript-eslint/parser',
    },
    {
      files: ['apps/mobile/**/*.{ts,tsx}'],
      extends: ['eslint:recommended'],
      parser: '@typescript-eslint/parser',
    },
  ],
};