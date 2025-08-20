import {
  ExecutorContext,
  logger,
  parseTargetString,
  readTargetOptions,
  runExecutor
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

  // 1) Wait for other targets if needed
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

  //   // 2) Prepare path remapping for "built libs first"
  //   const tsconfigOverridePath =
  //     options.tsConfigOverride &&
  //     buildTarget &&
  //     (shouldBuildApp ? options.runBuildTargetDependencies !== false : false)
  //       ? writeRuntimeTsconfigOverride(projectName, buildTarget, root, context)
  //       : null;

  yield* createAsyncIterable<{ success: boolean }>(async ({ next, done }) => {
    // Case 1: Run "raw" main file (without building it)
    if (options.main && !options.buildTarget) {
      const entry = resolve(context.root, options.main);
      const proc = launch(entry, options, cwd);
      const code = await waitForExit(proc);
      next({ success: code === 0 });
      done();
      return;
    }

    // Case 2: Build app first and then run the built main file
    if (options.buildTarget) {
      const buildTarget = parseTargetString(options.buildTarget, context);
      const buildOptions: Record<string, any> = {
        ...readTargetOptions(buildTarget, context),
        ...(options.buildTargetOptions || {}),
        target: buildTarget.target
      };
      const buildTargetExecutor =
        project.data.targets?.[buildTarget.target]?.executor;

      const buildIterator = await runExecutor<{
        success: boolean;
        outputPath?: string;
      }>(buildTarget, {}, context);

      let current: SpawnResult | null = null;

      for await (const res of buildIterator) {
        if (!res.success) {
          logger.error(`Build failed for ${options.buildTarget}`);
          next({ success: false });
          continue;
        }

        const entry = getFileToRun(
          context,
          project,
          buildOptions,
          buildTargetExecutor,
          options.main
        );

        await killProcess(current);
        current = launch(entry, options, cwd);
        const code = await waitForExit(current);
        next({ success: code === 0 });
      }

      await killProcess(current);
      done();
      return;
    }

    throw new Error(
      `Either "main" or "buildTarget" must be defined in executor options`
    );
  });
}

export default bunRunExecutor;
