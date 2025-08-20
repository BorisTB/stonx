import {
  ExecutorContext,
  logger,
  parseTargetString,
  readTargetOptions
} from '@nx/devkit';
import { createAsyncIterable } from '@nx/devkit/src/utils/async-iterable';
import { resolve } from 'node:path';
import {
  getBunVersion,
  killProcess,
  spawnProcess,
  SpawnResult,
  waitForExit
} from '../../utils';
import { RunExecutorOptions } from './schema';
import { getFileToRun } from './lib';

export interface BunRunExecutorOptions {
  main?: string;
  buildTarget?: string;
  args?: string[];
  runtimeArgs?: string[];
  cwd?: string;
  env?: Record<string, string>;
}

function buildArgs(entry: string, opts: BunRunExecutorOptions) {
  const args: string[] = [];
  if (opts.runtimeArgs?.length) args.push(...opts.runtimeArgs);
  args.push(entry);
  if (opts.args?.length) args.push(...opts.args);
  return args;
}

function launch(
  entry: string,
  opts: BunRunExecutorOptions,
  cwd: string
): SpawnResult {
  const bunCmd = process.platform === 'win32' ? 'bun.exe' : 'bun';
  const args = buildArgs(entry, opts);

  return spawnProcess(bunCmd, args, {
    cwd,
    env: opts.env,
    stdio: 'inherit'
  });
}

async function* bunRunExecutor(
  options: RunExecutorOptions,
  context: ExecutorContext
) {
  const bunVersion = await getBunVersion();

  if (!bunVersion) {
    throw new Error(`bun command not found. Make sure the bun is available`);
  }

  process.env.NODE_ENV ??= context?.configurationName ?? 'development';

  const project = context.projectGraph.nodes[context.projectName!];
  const cwd = options.cwd ? resolve(context.root, options.cwd) : context.root;

  yield* createAsyncIterable<{ success: boolean }>(async ({ next, done }) => {
    // Case 1: "main" only (no buildTarget)
    logger.log('Bun Run: 1');
    if (options.main && !options.buildTarget) {
      logger.log('Bun Run: 1.1');
      const entry = resolve(context.root, options.main);
      const proc = launch(entry, options, cwd);
      const code = await waitForExit(proc);
      logger.log('Bun Run: 1.2');
      next({ success: code === 0 });
      done();
      return;
    }

    // Case 2: buildTarget defined
    logger.log('Bun Run: 2');
    if (options.buildTarget) {
      logger.log('Bun Run: 2.1');
      const buildTarget = parseTargetString(options.buildTarget, context);
      const buildOptions: Record<string, any> = {
        ...readTargetOptions(buildTarget, context),
        ...(options.buildTargetOptions || {}),
        target: buildTarget.target
      };
      const buildTargetExecutor =
        project.data.targets?.[buildTarget.target]?.executor;

      logger.log('Bun Run: 2.2');

      let current: SpawnResult | null = null;

      const entry = getFileToRun(
        context,
        project,
        buildOptions,
        buildTargetExecutor,
        options.main
      );
      logger.log('Bun Run: 2.7');

      await killProcess(current);
      logger.log('Bun Run: 2.8');
      current = launch(entry, options, cwd);
      logger.log('Bun Run: 2.9');

      const code = await waitForExit(current);
      logger.log('Bun Run: 2.10');
      next({ success: code === 0 });
      logger.log('Bun Run: 2.11');

      await killProcess(current);
      logger.log('Bun Run: 2.12');
      done();
      logger.log('Bun Run: 2.13');
      return;
    }
    logger.log('Bun Run: 2.14');

    throw new Error(
      `Either "main" or "buildTarget" must be defined in executor options`
    );
  });
}

export default bunRunExecutor;
