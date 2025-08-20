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
  SpawnResult,
  spawnWithBun,
  waitForExit
} from '../../utils';
import { NormalizedRunExecutorOptions, RunExecutorOptions } from './schema';
import {
  buildBunArgs,
  getFileToRun,
  normalizeOptions,
  waitForTargets
} from './lib';

function launch(
  entry: string,
  opts: NormalizedRunExecutorOptions,
  cwd: string
): SpawnResult {
  const args = buildBunArgs(opts, entry);

  return spawnWithBun(args, {
    cwd,
    stdio: 'inherit'
  });
}

async function* bunRunExecutor(
  _options: RunExecutorOptions,
  context: ExecutorContext
) {
  const bunVersion = await getBunVersion();

  if (!bunVersion) {
    throw new Error(`bun command not found. Make sure the bun is available`);
  }

  process.env.NODE_ENV ??= context?.configurationName ?? 'development';

  const options = normalizeOptions(_options, context);

  const project = context.projectGraph.nodes[context.projectName!];
  const cwd = options.cwd ? resolve(context.root, options.cwd) : context.root;

  if (options.waitUntilTargets?.length) {
    const results = await waitForTargets(options.waitUntilTargets, context);
    for (const [i, result] of results.entries()) {
      if (!result.success) {
        throw new Error(
          `Wait until target failed: ${options.waitUntilTargets[i]}.`
        );
      }
    }
  }

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
