export default {
  plugins: ['typescript'],
  rules: {
    'typescript/ban-ts-comment': 'error',
    'typescript/consistent-type-assertions': 'warn',
    'typescript/consistent-type-imports': 'warn',
    'typescript/no-duplicate-enum-values': 'error',
    'typescript/no-empty-object-type': 'error',
    'typescript/no-extra-non-null-assertion': 'error',
    'typescript/no-misused-new': 'error',
    'typescript/no-namespace': 'error',
    'typescript/no-non-null-asserted-optional-chain': 'error',
    'typescript/no-require-imports': 'error',
    'typescript/no-this-alias': 'error',
    'typescript/no-unnecessary-type-constraint': 'error',
    'typescript/no-unsafe-declaration-merging': 'error',
    'typescript/no-unsafe-function-type': 'error',
    'typescript/no-wrapper-object-types': 'error',
    'typescript/prefer-as-const': 'error',
    'typescript/prefer-namespace-keyword': 'error',
    'typescript/triple-slash-reference': 'error',
  },
  overrides: [
    {
      files: ['**/*.{js,cjs}'],
      rules: {
        'typescript/no-require-imports': 'off',
      },
    },
    {
      files: ['vitest.setup.ts', '**/*.test.{tsx,ts}', '**/tests/**/*.{tsx,ts}'],
      rules: {
        'typescript/consistent-type-imports': 'off',
        'typescript/no-explicit-any': 'off',
      },
    },
  ],
};
