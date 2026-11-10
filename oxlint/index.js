import { merge } from '../lib/merge.js';

import core from './core.js';
import importRules from './import.js';
import jsxA11y from './jsx-a11y.js';
import promise from './promise.js';
import react from './react.js';
import typescript from './typescript.js';
import vitest from './vitest.js';

export const base = merge(
  {
    categories: { correctness: 'off' },
    env: { browser: true, node: true, commonjs: true },
    options: { reportUnusedDisableDirectives: 'warn' },
    ignorePatterns: ['**/node_modules/**', '**/.react-router/**', '**/.cache/**', '**/.vscode/**'],
  },
  core,
  typescript,
  importRules,
  react,
  jsxA11y,
  promise,
  vitest
);

export function createConfig(...configs) {
  return merge(base, ...configs);
}

export default base;
