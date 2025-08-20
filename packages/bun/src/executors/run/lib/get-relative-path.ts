import { relative, resolve } from 'node:path';
import { isRelativePathDefinition } from './is-relative-path-definition';
import { isAbsolute } from 'fast-glob/out/utils/pattern';

export function getRelativePath(from: string, to: string): string {
  const absFrom = isAbsolute(from) ? from : resolve('/', from);
  const absTo = isRelativePathDefinition(to)
    ? resolve(absFrom, to)
    : resolve('/', to);
  return relative(absFrom, absTo);
}
