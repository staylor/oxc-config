import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

function resolvePlugin() {
  try {
    return require.resolve('eslint-plugin-testing-library');
  } catch (error) {
    if (error.code !== 'MODULE_NOT_FOUND') {
      throw error;
    }

    throw new Error(
      '@wonderboymusic/oxc-config/oxlint/testing-library needs eslint-plugin-testing-library: pnpm add -D -E eslint-plugin-testing-library',
      { cause: error }
    );
  }
}

export default {
  jsPlugins: [{ name: 'testing-library', specifier: resolvePlugin() }],
  overrides: [
    {
      files: ['**/*.test.*'],
      rules: {
        'testing-library/await-async-events': [
          'error',
          {
            eventModule: 'userEvent',
          },
        ],
        'testing-library/await-async-queries': 'error',
        'testing-library/await-async-utils': 'error',
        'testing-library/no-await-sync-events': [
          'error',
          {
            eventModules: ['fire-event'],
          },
        ],
        'testing-library/no-await-sync-queries': 'error',
        'testing-library/no-debugging-utils': 'warn',
        'testing-library/no-dom-import': ['error', 'react'],
        'testing-library/no-global-regexp-flag-in-query': 'error',
        'testing-library/no-manual-cleanup': 'error',
        'testing-library/no-promise-in-fire-event': 'error',
        'testing-library/no-render-in-lifecycle': 'error',
        'testing-library/no-unnecessary-act': 'error',
        'testing-library/no-wait-for-multiple-assertions': 'error',
        'testing-library/no-wait-for-side-effects': 'error',
        'testing-library/no-wait-for-snapshot': 'error',
        'testing-library/prefer-find-by': 'error',
        'testing-library/prefer-presence-queries': 'error',
        'testing-library/prefer-query-by-disappearance': 'error',
        'testing-library/prefer-screen-queries': 'error',
        'testing-library/render-result-naming-convention': 'error',
      },
    },
    {
      files: ['**/*.test.ts', '**/*.test.tsx'],
      rules: {
        'testing-library/no-await-sync-events': 'off',
        'testing-library/prefer-user-event': 'off',
        'testing-library/render-result-naming-convention': 'off',
      },
    },
  ],
};
