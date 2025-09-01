import { spawn } from './spawn';
import { bun } from './bun';
import { node } from './node';
import { run } from './run';
import * as utils from './utils';
export * from './spawn';
export * from './bun';
export * from './node';
export * from './run';
export * from './utils';

export function createBuildConfig(config: Bun.BuildConfig) {
  return config;
}

export function build() {}

export const Buni = {
  ...utils,
  spawn,
  bun,
  node,
  run,
  createBuildConfig
};

export default Buni;
