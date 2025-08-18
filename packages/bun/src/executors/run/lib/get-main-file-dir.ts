import { dirname, relative } from 'node:path';
import { normalizePath } from 'nx/src/utils/path';

export function getRelativeDirectoryToProjectRoot(
  file: string,
  projectRoot: string
): string {
  const dir = dirname(file);
  const relativeDir = normalizePath(relative(projectRoot, dir));
  return relativeDir === '' ? `./` : `./${relativeDir}/`;
}
