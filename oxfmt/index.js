import { merge } from '../lib/merge.js';

export const base = {
  singleQuote: true,
  trailingComma: 'es5',
  printWidth: 100,
  sortPackageJson: false,
  sortImports: {
    newlinesBetween: true,
    internalPattern: ['#'],
    ignoreCase: false,
    customGroups: [{ groupName: 'tilde', elementNamePattern: ['~/**'] }],
    groups: [
      ['type-builtin', 'value-builtin'],
      ['type-external', 'value-external'],
      'tilde',
      ['type-internal', 'value-internal'],
      ['type-parent', 'value-parent'],
      ['type-sibling', 'value-sibling'],
      ['type-index', 'value-index'],
      'unknown',
    ],
  },
  ignorePatterns: ['**/node_modules', '**/dist', '**/build', '**/coverage', 'pnpm-lock.yaml'],
};

export function createConfig(...configs) {
  return merge(base, ...configs);
}

export default base;
