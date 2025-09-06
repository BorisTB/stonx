import { SpawnOptions } from '../spawn';
import { bun } from '../bun';

export function run(
  fileOrScript: string,
  args?: string[],
  options?: SpawnOptions
) {
  return bun(['run', fileOrScript, ...(args || [])], options);
}
