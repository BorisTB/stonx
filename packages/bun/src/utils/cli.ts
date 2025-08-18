import { workspaceRoot } from '@nx/devkit';
import { workerData } from 'node:worker_threads';
import type { ChildProcess, IOType, SpawnOptions } from 'node:child_process';
import { spawn as nodeSpawn } from 'node:child_process';
import { ForkOptions } from 'child_process';

export const isBun = typeof Bun !== 'undefined';

export type UniversalChildProcess =
  | ChildProcess
  | Bun.Subprocess<any, any, any>;

export function isBunSubprocess(
  process: UniversalChildProcess
): process is Bun.Subprocess<any, any, any> {
  return isBun && 'exited' in process;
}

export async function universalSpawnSync(cmd: string): Promise<string | null> {
  if (isBun) {
    const result = Bun.spawnSync({ cmd: cmd.split(' ') });
    const output = result.stdout?.toString().trim() || '';
    return output;
  }

  const { execSync } = await import('node:child_process');
  const output = execSync(cmd).toString().trim();
  return output;
}

export interface RunSpawnOptions {
  cwd?: string;
  stdin?: IOType;
  stdout?: IOType;
  stderr?: IOType;
  env?: Record<string, string | undefined>;
  windowsHide?: boolean;
}

export function runSpawn(
  cmd: string,
  args: string[] = [],
  options: RunSpawnOptions = {}
) {
  if (isBun) {
    return Bun.spawn({
      cmd: [cmd, ...args],
      stdout: 'pipe',
      stderr: 'pipe',
      ...options
    });
  } else {
    const { stdin, stdout, stderr, ...restOptions } = options;
    const spawnOptions: SpawnOptions = {
      ...restOptions
    };
    if (stdin || stdout || stderr) {
      spawnOptions.stdio = [stdin, stdout, stderr];
    }

    return nodeSpawn(cmd, args, spawnOptions);
  }
}

export interface SpawnWithBunOptions {
  cwd?: string;
  stdin?: IOType;
  stdout?: IOType;
  stderr?: IOType;
  env?: Record<string, unknown>;
}

export function spawnWithBun(
  args: string[],
  options: SpawnWithBunOptions = {}
): UniversalChildProcess {
  const cwd = options.cwd || workspaceRoot;
  const env = {
    ...process.env,
    ...(workerData || {}),
    ...(options.env || {})
  };
  const { stdin = 'ignore', stdout = 'pipe', stderr = 'pipe' } = options;

  if (isBun) {
    return Bun.spawn({
      cmd: ['bun', ...args],
      cwd,
      env,
      stdin,
      stdout,
      stderr
    });
  }

  const { spawn } = await import('node:child_process');

  return spawn('bun', args, {
    cwd,
    env,
    windowsHide: true,
    stdio: [stdin, stdout, stderr]
  });
}

export function runFork(
  modulePath: string,
  args: ReadonlyArray<string> = [],
  options: ForkOptions = {}
) {
  if (isBun) {
    // Bun.spawn version
    return Bun.spawn({
      cmd: ['bun', modulePath, ...args],
      stdin: 'inherit',
      stdout: 'inherit',
      stderr: 'pipe'
    });
  } else {
    // Node.js fork version
    const { fork } = await import('node:child_process');
    return fork(modulePath, args, options);
  }
}
