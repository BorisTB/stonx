import { BuildExecutorOptions } from '../schema';
import { ExecutorContext } from '@nx/devkit';

export function getBunBuildConfig(
  executorOptions: BuildExecutorOptions,
  context: ExecutorContext
): Bun.BuildConfig {
  return {
    entrypoints: [
      executorOptions.main,
      ...(executorOptions.additionalEntryPoints || [])
    ],
    define: executorOptions.define,
    outdir: executorOptions.outputPath,
    target: executorOptions.target,
    // external: executorOptions.external,
    format: executorOptions.format,
    minify: executorOptions.define,
    naming: executorOptions.naming,
    publicPath: executorOptions.publicPath,
    sourcemap: executorOptions.sourcemap,
    splitting: executorOptions.splitting,
    root: executorOptions.rootDir,
    packages: executorOptions.packages,
    loader: executorOptions.loader,
    env: executorOptions.env,
    banner: executorOptions.banner,
    footer: executorOptions.footer,
    drop: executorOptions.drop,
    tsconfig: executorOptions.tsConfig,
    throw: true
  };
}
