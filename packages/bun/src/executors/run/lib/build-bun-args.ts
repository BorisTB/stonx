import { NormalizedOptions } from './normalize-options';

export function buildBunArgs(
  options: NormalizedOptions,
  entryFile?: string
): string[] {
  const args: string[] = [];

  if (options.tsConfigOverride) {
    args.push(`--tsconfig-override=${options.tsConfigOverride}`);
  }
  if (options.inspect) {
    args.push(`--${options.inspect}`);
  }
  if (options.hot) {
    args.push('--hot');
  }
  if (options.watchMode === 'bun') {
    args.push('--watch');
  }
  if (options.config) {
    args.push(`-c ${options.config}`);
  }
  if (options.smol) {
    args.push('--smol');
  }
  if (options.bun) {
    args.push('--bun');
  }
  if (options.runtimeArgs?.length) {
    args.push(...options.runtimeArgs);
  }

  // `bun <file> -- <args...>`
  if (entryFile) {
    args.push(entryFile);

    if (options.args?.length) {
      args.push('--', ...options.args);
    }
  }
  return args;
}
