import vitest from '@vitest/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
  {
    files: ['src/**/*.spec.tsx'],
    plugins: { vitest },
    languageOptions: {
      parser: tsParser, // For TypeScript/JSX parsing
      globals: vitest.environments.env.globals, // Vitest globals
    },
    rules: {
      ...vitest.configs.recommended.rules,
      'vitest/no-identical-title': 'error',
    },
  },
];