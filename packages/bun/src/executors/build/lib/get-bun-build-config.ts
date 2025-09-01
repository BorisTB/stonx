import { NormalizedBuildExecutorOptions } from '../schema';
import Buni from '../../../utils/buni';

export function getBunBuildConfig(opts: NormalizedBuildExecutorOptions) {
  return Buni.createBuildConfig({
    entrypoints: [opts.main, ...(opts.additionalEntryPoints || [])],
    define: opts.define,
    outdir: opts.outputPath,
    target: opts.target,
    format: opts.format,
    minify: opts.minify,
    naming: opts.naming,
    publicPath: opts.publicPath,
    sourcemap: opts.sourcemap,
    splitting: opts.splitting,
    root: opts.rootDir,
    packages: opts.packages,
    loader: opts.loader,
    env: opts.env,
    banner: opts.banner,
    footer: opts.footer,
    drop: opts.drop,
    tsconfig: opts.tsConfig,
    throw: true
  });
}
