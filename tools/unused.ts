import { findUnusedExports } from '@goatjs/node/ts-unused-exports';

const unused = findUnusedExports({
  ignoreFiles: ['eslint.config.js', 'jest.config.ts', 'image-colors.ts'],
  ignoreVars: [],
});

if (unused) {
  throw new Error(`The following exports are unused, add them on the ignore or remove the exports to continue.\n${JSON.stringify(unused)}`);
}
