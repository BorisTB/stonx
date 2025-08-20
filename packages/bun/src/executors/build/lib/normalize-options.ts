import { join, resolve } from 'node:path';
import {
  BuildExecutorOptions,
  NormalizedBuildExecutorOptions
} from '../schema';

export function normalizeOptions(
  options: BuildExecutorOptions,
  contextRoot: string,
  sourceRoot: string | undefined,
  projectRoot: string
): NormalizedBuildExecutorOptions {
  const outputPath = join(contextRoot, options.outputPath);
  const rootDir = options.rootDir
    ? join(contextRoot, options.rootDir)
    : join(contextRoot, projectRoot);

  if (options.watch == null) {
    options.watch = false;
  }

  if (Array.isArray(options.external) && options.external.length > 0) {
    const firstItem = options.external[0];
    if (firstItem === 'all' || firstItem === 'none') {
      options.external = firstItem;
    }
  }

  return {
    ...options,
    root: contextRoot,
    sourceRoot,
    projectRoot,
    outputPath,
    tsConfig: join(contextRoot, options.tsConfig),
    rootDir,
    mainOutputPath: resolve(
      outputPath,
      options.main.replace(`${projectRoot}/`, '').replace('.ts', '.js')
    ),
    generatePackageJson: options.generatePackageJson ?? true
  };
}
