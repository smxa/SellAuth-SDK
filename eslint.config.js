// ESLint flat config for TypeScript
import js from '@eslint/js';
// Using @typescript-eslint rules manually

import parser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier/flat';

export default [
  {
    ignores: ['dist/**', 'node_modules/**', '**/*.d.ts'],
  },
  js.configs.recommended,
  prettier,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser,
      parserOptions: { project: false, sourceType: 'module' },
      globals: {
        console: 'readonly',
        process: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        fetch: 'readonly',
        AbortController: 'readonly',
        AbortSignal: 'readonly',
        FormData: 'readonly',
        File: 'readonly',
        Blob: 'readonly',
        Response: 'readonly',
      },
    },
    // TS plugin omitted for now; add later when full preset desired
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
];
