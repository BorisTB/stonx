import { BuildExecutorOptions } from '../schema';
import { ExecutorContext } from '@nx/devkit';
import { getBunBuildConfig } from './get-bun-build-config';

const isNil = (value: any): value is undefined | null => value == null;
const isString = (value: any): value is string => typeof value === 'string';

export function getBunBuildArgv(
  options: BuildExecutorOptions,
  context: ExecutorContext
): string[] {
  const cfg = getBunBuildConfig(options, context);
  const production = process.env?.NODE_ENV === 'production';

  const allArgs = [
    'build',

    !isNil(options.config) && `--config=${options.config}`,
    !isNil(options.tsConfig) && `--tsconfig-override=${options.tsConfig}`,
    !isNil(options.bun) && `--bun`,
    !isNil(options.smol) && `--smol`,

    cfg.entrypoints.join(' '),

    production && '--production',
    !isNil(cfg.target) && `--target=${cfg.target}`,
    !isNil(cfg.root) && `--root=${cfg.root}`,
    !isNil(cfg.env) && `--env=${cfg.env}`,
    !isNil(cfg.outdir) && `--outdir=${cfg.outdir}`,
    !isNil(cfg.sourcemap) && `--sourcemap=${cfg.sourcemap}`,
    !isNil(cfg.publicPath) && `--public-path=${cfg.publicPath}`,
    !isNil(cfg.naming) && `--entry-naming=${cfg.naming}`,
    !isNil(cfg.naming) && `--chunk-naming=${cfg.naming}`,
    !isNil(cfg.naming) && `--asset-naming=${cfg.naming}`,
    cfg.splitting && `--splitting`,
    cfg.minify && `--minify`,
    options.watch && `--watch`,
    !isNil(cfg.format) && `--format=${cfg.format}`,
    !isNil(cfg.external) && `--external=${cfg.external}`,
    !isNil(cfg.packages) && `--packages=${cfg.packages}`,
    !isNil(cfg.banner) && `--banner=${cfg.banner}`,
    !isNil(cfg.footer) && `--footer=${cfg.footer}`
  ];

  const args = allArgs.filter(isString);

  return args;
}
