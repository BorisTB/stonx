import { SpawnOptions, spawn } from '../spawn';
import { getBunCmd } from '../utils';

export function bun(args?: string[], options?: SpawnOptions) {
  return spawn(getBunCmd(), args, options);
}
