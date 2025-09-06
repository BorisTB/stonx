import { join, resolve } from 'node:path';
import {
  BuildExecutorOptions,
  NormalizedBuildExecutorOptions
} from '../schema';
import { ExecutorContext } from '@nx/devkit';

export function normalizeOptions(
  options: BuildExecutorOptions,
  context: ExecutorContext,
  sourceRoot: string | undefined,
  projectRoot: string
): NormalizedBuildExecutorOptions {
  const root = context.root;
  const outputPath = join(root, options.outputPath);
  const rootDir = options.rootDir
    ? join(root, options.rootDir)
    : join(root, projectRoot); // TODO
  const mainOutputPath = resolve(
    outputPath,
    options.main.replace(`${projectRoot}/`, '').replace('.ts', '.js') // TODO
  );

  const tsConfig = join(root, options.tsConfig);

  const watch = options.watch ?? false;
  const generatePackageJson = options.generatePackageJson ?? true;

  const splitting = options.splitting ?? true;

  const sourcemap =
    typeof options.sourcemap === 'boolean'
      ? options.sourcemap
        ? 'inline'
        : 'none'
      : options.sourcemap;

  if (Array.isArray(options.external) && options.external.length > 0) {
    const firstItem = options.external[0];
    if (firstItem === 'all' || firstItem === 'none') {
      options.external = firstItem;
    }
  }

  return {
    ...options,
    splitting,
    sourcemap,
    root,
    sourceRoot,
    projectRoot,
    outputPath,
    tsConfig,
    rootDir,
    watch,
    mainOutputPath,
    generatePackageJson
  };
}
