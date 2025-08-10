/* eslint-disable */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

let dir;
let __filename;

if (typeof __dirname === 'undefined') {
  // @ts-ignore
  __filename = fileURLToPath(import.meta.url);
  __dirname = dirname(__filename);
} else {
  dir = __dirname;
}

// Reading the SWC compilation config for the spec files
const swcJestConfig = JSON.parse(readFileSync(`${dir}/.spec.swcrc`, 'utf-8'));

// Disable .swcrc look-up by SWC core because we're passing in swcJestConfig ourselves
swcJestConfig.swcrc = false;

export default {
  displayName: 'elysia-e2e',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]s$': ['@swc/jest', swcJestConfig]
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: 'test-output/jest/coverage',
  globalSetup: '../../tools/scripts/start-local-registry.ts',
  globalTeardown: '../../tools/scripts/stop-local-registry.ts'
};
