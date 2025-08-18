import { ChildProcess } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { createAsyncIterable } from '@nx/devkit/src/utils/async-iterable';
import {
  ExecutorContext,
  parseTargetString,
  readTargetOptions,
  logger,
  runExecutor,
  isDaemonEnabled
} from '@nx/devkit';

import {
  getBunVersion,
  isBunSubprocess,
  runFork,
  spawnWithBun,
  UniversalChildProcess
} from '../../utils';
import { RunExecutorOptions } from './schema';
import { debounce } from './lib/debounce';
import { getFileToRun } from './lib/get-file-to-run';
import { getExecArgv } from './lib/get-exec-argv';
import { runWaitUntilTargets } from './lib/run-wait-until-targets';
import { fileToRunCorrectPath } from './lib/file-to-run-correct-path';
import { killTree } from './lib/kill-tree';
import { daemonClient } from 'nx/src/daemon/client/client';

interface ActiveTask {
  id: string;
  killed: boolean;
  promise: Promise<void> | null;
  childProcess: UniversalChildProcess | null;
  start: () => Promise<void>;
  stop: (signal: NodeJS.Signals) => Promise<void>;
}

export default async function* bunRunExecutor(
  options: RunExecutorOptions,
  context: ExecutorContext
) {
  const bunVersion = await getBunVersion();

  if (!bunVersion) {
    throw new Error(`bun command not found. Make sure the bun is available`);
  }

  if (!context.projectName) {
    throw new Error(`project name is undefined`);
  }

  process.env.NODE_ENV ??= context?.configurationName ?? 'development';

  const project = context.projectGraph.nodes[context.projectName];
  const buildTarget = parseTargetString(options.buildTarget, context);
  const projectBuildTargetConfig = project.data.targets?.[buildTarget.target];

  if (!projectBuildTargetConfig) {
    throw new Error(
      `Cannot find build target ${options.buildTarget} for project ${context.projectName}`
    );
  }

  const buildTargetExecutor = projectBuildTargetConfig.executor;

  if (buildTargetExecutor === 'nx:run-commands') {
    // Run commands does not emit build event, so we have to switch to run entire build through Nx CLI.
    options.runBuildTargetDependencies = true;
  }

  const buildOptions: Record<string, unknown> = {
    ...readTargetOptions(buildTarget, context),
    ...options.buildTargetOptions,
    target: buildTarget.target
  };

  if (options.waitUntilTargets && options.waitUntilTargets.length > 0) {
    const results = await runWaitUntilTargets(options, context);
    for (const [i, result] of results.entries()) {
      if (!result.success) {
        throw new Error(
          `Wait until target failed: ${options.waitUntilTargets[i]}.`
        );
      }
    }
  }

  // Re-map buildable workspace projects to their output directory.
  // const mappings = calculateResolveMappings(context, options);
  const fileToRun = getFileToRun(
    context,
    project,
    buildOptions,
    buildTargetExecutor
  );

  let additionalExitHandler: null | (() => void) = null;
  let currentTask: ActiveTask | null = null;
  const tasks: ActiveTask[] = [];

  const args = getExecArgv(options);

  yield* createAsyncIterable<{
    success: boolean;
    options?: Record<string, any>;
  }>(async ({ done, next, error, registerCleanup }) => {
    const processQueue = async () => {
      if (tasks.length === 0) return;

      const previousTask = currentTask;
      const task = tasks.shift();
      currentTask = task ?? null;
      await previousTask?.stop('SIGTERM');
      await task?.start();
    };

    const debouncedProcessQueue = debounce(
      processQueue,
      options.debounce ?? 1_000
    );

    const addToQueue = async (
      childProcess: null | ChildProcess,
      buildResult: Promise<{ success: boolean }>
    ) => {
      const task: ActiveTask = {
        id: randomUUID(),
        killed: false,
        childProcess,
        promise: null,
        start: async () => {
          // Wait for build to finish.
          const result = await buildResult;

          if (result && !result.success) {
            if (options.watch) {
              if (!task.killed) {
                logger.error(`Build failed, waiting for changes to restart...`);
              }
              return;
            } else {
              throw new Error(`Build failed. See above for errors.`);
            }
          }

          if (task.killed) {
            return;
          }

          // Run the program
          task.promise = new Promise<void>(async (resolve, reject) => {
            const proc = spawnWithBun(
              ['run', ...args, fileToRunCorrectPath(fileToRun)],
              {
                stderr: 'pipe',
                stdin: 'inherit',
                stdout: 'inherit'
              }
            );

            task.childProcess = proc;

            if (isBunSubprocess(proc)) {
              const stderrReader = proc.stderr?.getReader();

              const handleStderr = async () => {
                if (!stderrReader) {
                  return;
                }

                try {
                  while (true) {
                    const { done, value } = await stderrReader.read();
                    if (done || task.killed) break;
                    if (value) logger.error(new TextDecoder().decode(value));
                  }
                } catch (err) {
                  if (!task.killed)
                    logger.error(`Error reading stderr: ${err}`);
                }
              };

              handleStderr();

              proc.exited.then((code) => {
                stderrReader?.cancel();
                handleExit(code);
              });
            } else {
              // Node stderr handling
              const handleStdErr = (data: ArrayBuffer) => {
                if (!options.watch || !task.killed) {
                  logger.error(data.toString());
                }
              };
              proc.stderr?.on('data', handleStdErr);
              proc.once('exit', (code) => {
                proc?.off('data', handleStdErr);
                handleExit(code ?? 0);
              });
            }

            function handleExit(code: number) {
              if (options.watch && !task.killed) {
                logger.info(
                  `NX Process exited with code ${code}, waiting for changes to restart...`
                );
              }
              if (!options.watch) {
                if (code !== 0) {
                  reject(new Error(`Process exited with code ${code}`));
                } else {
                  resolve(done());
                }
              }
              resolve();
            }

            next({ success: true, options: buildOptions });
          });
        },
        stop: async (signal: NodeJS.Signals = 'SIGTERM') => {
          task.killed = true;

          if (task.childProcess?.pid) {
            await killTree(task.childProcess.pid, signal);
          }
          try {
            await task.promise;
          } catch {}
        }
      };

      tasks.push(task);
    };

    const output = await runExecutor(
      buildTarget,
      {
        ...options.buildTargetOptions,
        watch: options.watch
      },
      context
    );
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const event = await output.next();
      await addToQueue(null, Promise.resolve(event.value));
      await debouncedProcessQueue();
      if (event.done || !options.watch) {
        break;
      }
    }

    const stopAllTasks = async (signal: NodeJS.Signals = 'SIGTERM') => {
      if (typeof additionalExitHandler === 'function') {
        additionalExitHandler();
      }
      if (typeof currentTask?.stop === 'function') {
        await currentTask.stop(signal);
      }
      for (const task of tasks) {
        await task.stop(signal);
      }
    };

    process.on('SIGTERM', async () => {
      await stopAllTasks('SIGTERM');
      process.exit(128 + 15);
    });
    process.on('SIGINT', async () => {
      await stopAllTasks('SIGINT');
      process.exit(128 + 2);
    });
    process.on('SIGHUP', async () => {
      await stopAllTasks('SIGHUP');
      process.exit(128 + 1);
    });

    registerCleanup?.(async () => {
      await stopAllTasks('SIGTERM');
    });

    if (options.runBuildTargetDependencies) {
      const runBuild = async () => {
        let childProcess: UniversalChildProcess | null = null;
        const whenReady = new Promise<{ success: boolean }>(async (resolve) => {
          childProcess = runFork(
            require.resolve('nx'),
            [
              'run',
              `${context.projectName}:${buildTarget.target}${
                buildTarget.configuration ? `:${buildTarget.configuration}` : ''
              }`
            ],
            {
              cwd: context.root,
              stdio: 'inherit'
            }
          );

          const handleExit = (code: number | null) => {
            if (code === 0) resolve({ success: true });
            // If process is killed due to current task being killed, then resolve with success.
            else resolve({ success: !!currentTask?.killed });
          };

          if (isBunSubprocess(childProcess)) {
            childProcess.exited.then(handleExit);
          } else {
            childProcess.once('exit', handleExit);
          }
        });
        await addToQueue(childProcess, whenReady);
        await debouncedProcessQueue();
      };

      if (isDaemonEnabled()) {
        additionalExitHandler = await daemonClient.registerFileWatcher(
          {
            watchProjects: [context.projectName || ''],
            includeDependentProjects: true
          },
          async (err, data) => {
            if (err === 'closed') {
              logger.error(`Watch error: Daemon closed the connection`);
              process.exit(1);
            } else if (err) {
              logger.error(`Watch error: ${err?.message ?? 'Unknown'}`);
            } else {
              if (options.watch) {
                logger.info(`NX File change detected. Restarting...`);
                await runBuild();
              }
            }
          }
        );
      } else {
        logger.warn(
          `NX Daemon is not running. Node process will not restart automatically after file changes.`
        );
      }
      await runBuild(); // run first build
    } else {
      // Otherwise, run the build executor, which will not run task dependencies.
      // This is mostly fine for bundlers like webpack that should already watch for dependency libs.
      // For tsc/swc or custom build commands, consider using `runBuildTargetDependencies` instead.
      const output = await runExecutor(
        buildTarget,
        {
          ...options.buildTargetOptions,
          watch: options.watch
        },
        context
      );
      while (true) {
        const event = await output.next();
        await addToQueue(null, Promise.resolve(event.value));
        await debouncedProcessQueue();
        if (event.done || !options.watch) {
          break;
        }
      }
    }
  });
}
