const js = require('@eslint/js');
const globals = require('globals');
const tseslint = require('typescript-eslint');
const reactPlugin = require('eslint-plugin-react');
const { defineConfig } = require('eslint/config');

module.exports = defineConfig([
  {
    ignores: ['dist', 'eslint.config.cjs'],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: {
      globals: globals.browser,
    },
  },
  ...tseslint.configs.recommended,
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat['jsx-runtime'],
  {
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
]);
