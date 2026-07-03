// Extends the shared @and3rn3t/eslint-config with huggingface-specific rules.
import and3rn3t from '@and3rn3t/eslint-config';

export default [
  ...and3rn3t,
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
];
