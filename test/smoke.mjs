import { spawnSync } from 'node:child_process';
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { createConfig as createOxfmtConfig } from '../oxfmt/index.js';
import { createConfig } from '../oxlint/index.js';

const BASE_CODES = [
  'eslint(eqeqeq)',
  'eslint(no-unused-vars)',
  'import(no-duplicates)',
  'jsx-a11y(alt-text)',
  'promise(catch-or-return)',
  'react(jsx-key)',
  'typescript(no-namespace)',
  'vitest(consistent-test-it)',
  'vitest(no-focused-tests)',
];
const TESTING_LIBRARY_CODES = ['testing-library(no-debugging-utils)'];

const root = path.resolve(import.meta.dirname, '..');
const manifest = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
const work = mkdtempSync(path.join(tmpdir(), 'oxc-config-smoke-'));
const consumer = path.join(work, 'consumer');
const minimal = path.join(work, 'minimal');
const failures = [];

const check = (condition, message) => {
  if (!condition) {
    failures.push(message);
  }
};

const pinned = (name) => `${name}@${manifest.devDependencies[name]}`;

function run(command, args, options) {
  return spawnSync(command, args, { encoding: 'utf8', ...options });
}

function mustRun(command, args, options) {
  const result = run(command, args, options);

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(
      `${command} ${args.join(' ')} exited ${result.status}\n${result.stdout}${result.stderr}`
    );
  }

  return result;
}

function pack() {
  mustRun('pnpm', ['pack', '--pack-destination', work], { cwd: root });

  return path.join(
    work,
    readdirSync(work).find((name) => name.endsWith('.tgz'))
  );
}

function installConsumer(dir, packages) {
  mkdirSync(dir);
  writeFileSync(
    path.join(dir, 'package.json'),
    JSON.stringify({ name: path.basename(dir), private: true, type: 'module' })
  );
  // Without hoisting the consumer cannot see the package's own dependencies, as in a real strict install
  writeFileSync(path.join(dir, '.npmrc'), 'hoist=false\nsave-exact=true\n');
  mustRun('pnpm', ['add', '-D', ...packages], { cwd: dir });
  cpSync(path.join(root, 'test/fixtures'), dir, { recursive: true });
}

function writeLintConfig(dir, { testingLibrary }) {
  const config = testingLibrary
    ? `import { createConfig } from '${manifest.name}/oxlint';
import testingLibrary from '${manifest.name}/oxlint/testing-library';

export default createConfig(testingLibrary);
`
    : `import { createConfig } from '${manifest.name}/oxlint';

export default createConfig();
`;

  writeFileSync(path.join(dir, 'oxlint.config.ts'), config);
}

function lint(dir) {
  const result = run(path.join(dir, 'node_modules/.bin/oxlint'), ['--format', 'json', '.'], {
    cwd: dir,
  });

  if (result.error) {
    failures.push(
      `oxlint could not run to completion in ${path.basename(dir)} (${result.error.code ?? result.error.message}); is node_modules being linted?`
    );
    return null;
  }

  try {
    return { result, report: JSON.parse(result.stdout) };
  } catch {
    failures.push(
      `oxlint did not produce a report in ${path.basename(dir)}:\n${result.stdout}${result.stderr}`
    );
    return null;
  }
}

function checkLint() {
  writeLintConfig(consumer, { testingLibrary: true });
  const linted = lint(consumer);

  if (!linted) {
    return;
  }

  const { result, report } = linted;
  const codes = new Set(report.diagnostics.map((diagnostic) => diagnostic.code));

  for (const code of [...BASE_CODES, ...TESTING_LIBRARY_CODES]) {
    check(codes.has(code), `expected ${code} to be reported`);
  }

  for (const ignored of ['.react-router', 'node_modules']) {
    check(
      !report.diagnostics.some((diagnostic) => diagnostic.filename.includes(ignored)),
      `files under ${ignored} were linted`
    );
  }

  check(result.stderr.trim() === '', `oxlint wrote to stderr:\n${result.stderr}`);
}

function checkWithoutTestingLibrary() {
  const installed = readdirSync(path.join(minimal, 'node_modules/.pnpm'));

  check(
    !installed.some(
      (name) => name.startsWith('eslint@') || name.startsWith('eslint-plugin-testing-library@')
    ),
    'a consumer without eslint-plugin-testing-library still installs ESLint'
  );

  writeLintConfig(minimal, { testingLibrary: false });
  const linted = lint(minimal);

  if (linted) {
    const codes = new Set(linted.report.diagnostics.map((diagnostic) => diagnostic.code));

    for (const code of BASE_CODES) {
      check(codes.has(code), `expected ${code} to be reported without the testing-library plugin`);
    }
  }

  writeLintConfig(minimal, { testingLibrary: true });
  const result = run(path.join(minimal, 'node_modules/.bin/oxlint'), ['.'], { cwd: minimal });

  check(
    result.status !== 0 &&
      `${result.stdout}${result.stderr}`.includes('pnpm add -D -E eslint-plugin-testing-library'),
    `the testing-library fragment does not explain the missing plugin:\n${result.stdout}${result.stderr}`
  );
}

function checkFormat() {
  writeFileSync(
    path.join(consumer, 'oxfmt.config.ts'),
    `import { createConfig } from '${manifest.name}/oxfmt';

export default createConfig();
`
  );

  const oxfmt = path.join(consumer, 'node_modules/.bin/oxfmt');
  const messy = path.join(consumer, 'format/messy.ts');
  const expected = readFileSync(path.join(root, 'test/fixtures/format/expected.ts'), 'utf8');

  mustRun(oxfmt, [messy], { cwd: consumer });
  check(readFileSync(messy, 'utf8') === expected, 'oxfmt output differs from format/expected.ts');
  check(run(oxfmt, ['--check', messy], { cwd: consumer }).status === 0, 'oxfmt is not idempotent');
}

function checkMerge() {
  const merged = createConfig({
    ignorePatterns: ['dist/**'],
    settings: { react: { version: '19.2.8' } },
    rules: { eqeqeq: 'off' },
  });

  check(
    merged.ignorePatterns.includes('**/node_modules/**') &&
      merged.ignorePatterns.includes('dist/**'),
    'createConfig does not combine ignorePatterns'
  );
  check(
    merged.settings?.react?.version === '19.2.8' &&
      merged.settings.react.linkComponents?.length > 0,
    'createConfig replaces settings.react instead of merging it'
  );
  check(merged.rules.eqeqeq === 'off', 'createConfig does not let consumer rules win');
  check(merged.env?.browser && merged.env.node, 'createConfig loses env');

  const formatter = createOxfmtConfig({ ignorePatterns: ['generated/**'] });

  check(
    formatter.ignorePatterns.includes('generated/**') &&
      formatter.ignorePatterns.includes('pnpm-lock.yaml'),
    'oxfmt createConfig does not combine ignorePatterns'
  );
}

try {
  const tarball = pack();

  installConsumer(consumer, [
    pinned('oxlint'),
    pinned('oxfmt'),
    pinned('eslint-plugin-testing-library'),
    tarball,
  ]);
  installConsumer(minimal, [pinned('oxlint'), tarball]);
  checkLint();
  checkWithoutTestingLibrary();
  checkFormat();
  checkMerge();
} catch (error) {
  failures.push(error.message ?? String(error));
} finally {
  rmSync(work, { recursive: true, force: true });
}

if (failures.length > 0) {
  console.error(failures.map((failure) => `- ${failure}`).join('\n'));
  process.exit(1);
}

console.log('smoke test passed');
