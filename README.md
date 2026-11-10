# @wonderboymusic/oxc-config

Shared [oxlint](https://oxc.rs/docs/guide/usage/linter) and [oxfmt](https://oxc.rs/docs/guide/usage/formatter) configuration for TypeScript, React and Vitest projects. It carries over the rules and formatting of [`@wonderboymusic/eslint-config`](https://github.com/staylor/eslint-config).

## Install

```sh
pnpm add -D -E @wonderboymusic/oxc-config oxlint oxfmt
```

Node.js 22.18 or later is required, because oxlint loads `oxlint.config.ts` itself. The config is tested with oxlint 1.91.0 and oxfmt 0.76.0. oxlint reports a rule it does not know as a configuration error, so a release that renames or removes a rule fails loudly instead of silently dropping it.

## Linting

```ts
// oxlint.config.ts
import { createConfig } from '@wonderboymusic/oxc-config/oxlint';

export default createConfig({
  ignorePatterns: ['dist/**'],
});
```

Add the Testing Library rules, which run through the `eslint-plugin-testing-library` JS plugin, by installing that plugin and passing the fragment too:

```sh
pnpm add -D -E eslint-plugin-testing-library
```

```ts
import { createConfig } from '@wonderboymusic/oxc-config/oxlint';
import testingLibrary from '@wonderboymusic/oxc-config/oxlint/testing-library';

export default createConfig(testingLibrary, {
  jsPlugins: [{ name: 'my-plugin', specifier: 'eslint-plugin-my-plugin' }],
});
```

`createConfig` merges the base with each config you pass, in order. Rules from later configs win. `plugins`, `jsPlugins`, `ignorePatterns` and `overrides` are concatenated, and `settings` are merged per plugin.

Use `createConfig` rather than `extends`. oxlint only inherits `rules`, `plugins`, `jsPlugins`, `categories`, `options` and `overrides` from an extended config, so `env`, `globals`, `settings` and `ignorePatterns` would be dropped without a warning.

The React version is read from the installed `react` package, because oxlint has no `detect` setting. Existing `// eslint-disable` comments keep working.

## Formatting

```ts
// oxfmt.config.ts
import { createConfig } from '@wonderboymusic/oxc-config/oxfmt';

export default createConfig({
  sortTailwindcss: {},
});
```

Single quotes, es5 trailing commas and a print width of 100. Imports are sorted into builtin, external, `~/`, `#` internal, parent, sibling and index groups with a blank line between them, which replaces `import-x/order`. Sorting `package.json` is off, and Tailwind class sorting is opt-in.

## Coming from `@wonderboymusic/eslint-config`

Every rule maps to an oxlint rule except these:

- `import-x/order`: covered by oxfmt's import sorting.
- `react/no-typos`: not implemented in oxlint.
- `promise/no-return-in-finally`: still a nursery rule.
- `new-parens` and `no-mixed-operators`: stylistic rules oxlint does not implement.
- `no-dupe-args` and `no-octal`: superseded by strict mode.

`prettier/prettier` is replaced by oxfmt.

## License

MIT
