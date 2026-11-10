import { createRequire } from 'node:module';
import path from 'node:path';

function installedReactVersion() {
  try {
    return createRequire(path.join(process.cwd(), 'package.json'))('react/package.json').version;
  } catch {
    return undefined;
  }
}

const version = installedReactVersion();

export default {
  plugins: ['react'],
  settings: {
    react: {
      ...(version && { version }),
      formComponents: ['Form'],
      linkComponents: [
        { name: 'Link', attribute: 'to' },
        { name: 'NavLink', attribute: 'to' },
      ],
    },
  },
  rules: {
    'react/display-name': 'warn',
    'react/exhaustive-deps': 'warn',
    'react/jsx-key': 'warn',
    'react/jsx-no-comment-textnodes': 'warn',
    'react/jsx-no-target-blank': 'warn',
    'react/jsx-no-undef': 'error',
    'react/jsx-no-useless-fragment': 'error',
    'react/jsx-pascal-case': [
      'warn',
      {
        allowAllCaps: true,
        ignore: [],
      },
    ],
    'react/no-danger-with-children': 'warn',
    'react/no-unknown-property': 'error',
    'react/rules-of-hooks': 'error',
    'react/style-prop-object': 'warn',
  },
};
