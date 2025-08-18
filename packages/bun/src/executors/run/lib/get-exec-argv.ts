import { RunExecutorOptions } from '../schema';

export function getExecArgv(options: RunExecutorOptions): string[] {
  const args: string[] = [];

  if (options.watch) {
    args.push('--watch');
  }
  if (options.hot) {
    args.push('--hot');
  }
  if (options.config) {
    args.push(`-c ${options.config}`);
  }
  if (options.tsConfig) {
    args.push(`--tsconfig-override=${options.tsConfig}`);
  }
  if (options.smol) {
    args.push('--smol');
  }
  if (options.bun) {
    args.push('--bun');
  }
  return args;
}
