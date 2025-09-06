import {
  spawn as nodeSpawn,
  ChildProcess,
  type IOType,
  StdioOptions
} from 'node:child_process';
import { workspaceRoot } from '@nx/devkit';

export function isBunRuntime(): boolean {
  return typeof Bun !== 'undefined';
}

export function getBunCmd(): string {
  return process.env.BUN_BIN || 'bun';
}

export interface SpawnOptions {
  cwd?: string;
  stdio?: StdioOptions;
  stdin?: IOType;
  stdout?: IOType;
  stderr?: IOType;
  env?: Record<string, string>;
}

export type SpawnResult = ChildProcess | Bun.Subprocess;

export function isBunSubprocess(
  spawnResult: SpawnResult
): spawnResult is Bun.Subprocess {
  return isBunRuntime() && 'exited' in spawnResult;
}

export function spawnProcess(
  command: string,
  args: string[] = [],
  options: SpawnOptions = {}
): SpawnResult {
  const cwd = options.cwd || workspaceRoot;

  const env: Record<string, string | undefined> = {
    ...process.env,
    ...(options.env || {})
  };

  const {
    stdin = 'inherit',
    stdout = 'inherit',
    stderr = 'inherit',
    stdio = 'inherit'
  } = options;

  if (isBunRuntime()) {
    return Bun.spawn({
      cmd: [command, ...args],
      cwd,
      env,
      stdio: [stdin, stdout, stderr]
    });
  }

  return nodeSpawn(command, args, {
    cwd,
    env,
    stdio
  });
}

export function spawnWithBun(args?: string[], options?: SpawnOptions) {
  return spawnProcess(getBunCmd(), args, options);
}

export async function waitForExit(proc: SpawnResult): Promise<number> {
  if (isBunRuntime()) {
    const sub = proc as Bun.Subprocess;
    return sub.exited.then(() => sub.exitCode ?? 1);
  }
  const child = proc as ChildProcess;
  return new Promise((resolve) => {
    child.on('close', (code) => resolve(code ?? 1));
    child.on('error', () => resolve(1));
  });
}

export async function killProcess(proc: SpawnResult | null) {
  if (!proc) return;

  if (isBunRuntime()) {
    try {
      (proc as Bun.Subprocess).kill();
    } catch (err) {
      console.log(err);
    }

    return;
  }

  const child = proc as ChildProcess;
  if (child.killed) return;
  return new Promise<void>((resolve) => {
    child.once('exit', () => resolve());
    child.kill('SIGTERM');
    setTimeout(() => {
      try {
        if (!child.killed) child.kill('SIGKILL');
      } catch (err) {
        console.log(err);
      }
      resolve();
    }, 3000);
  });
}
