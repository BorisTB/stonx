import { SpawnOptions, spawn } from '../spawn';

export function node(args?: string[], options?: SpawnOptions) {
  return spawn('node', args, options);
}
