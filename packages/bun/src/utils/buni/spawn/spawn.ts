import {
  ChildProcess,
  type IOType,
  spawn as nodeSpawn,
  StdioOptions
} from 'node:child_process';
import { isBunRuntime } from '../utils';

export interface SpawnOptions {
  cwd?: string;
  stdio?: StdioOptions;
  stdin?: IOType;
  stdout?: IOType;
  stderr?: IOType;
  env?: Record<string, string>;
}

export type SpawnResult = ChildProcess | Bun.Subprocess;

export function spawn(
  command: string,
  args: string[] = [],
  options: SpawnOptions = {}
): SpawnResult {
  const { cwd, env, stdin, stdout, stderr, stdio } = options;

  if (isBunRuntime()) {
    const opts: Bun.SpawnOptions.OptionsObject<any, any, any> = {};

    if (cwd) {
      opts.cwd = cwd;
    }

    if (env) {
      opts.env = env;
    }

    if (stdin) {
      opts.stdin = stdin;
    }

    if (stdin) {
      opts.stdin = stdin;
    }

    if (stdout) {
      opts.stdout = stdout;
    }

    if (stderr) {
      opts.stderr = stderr;
    }
    return Bun.spawn({
      cmd: [command, ...args],
      ...opts
    });
  }

  console.log(`Command: ${command}`);
  console.log(`Args: ${args.join(' ')}`);
  return nodeSpawn(command, args, {
    cwd,
    env,
    stdio
  });
}
