import { InspectType, RunExecutorOptions, WatchMode } from '../schema';
import { ExecutorContext } from '@nx/devkit';
import { resolve } from 'node:path';

export interface NormalizedOptions extends Omit<RunExecutorOptions, 'inspect'> {
  projectName: string;
  root: string;
  cwd: string;
  watchMode: Exclude<WatchMode, true>;
  inspect: false | InspectType;
  shouldBuildApp: boolean;
  shouldBuildDependencies: boolean;
}

export function normalizeOptions(
  options: RunExecutorOptions,
  context: ExecutorContext
): NormalizedOptions {
  const projectName = context.projectName!;
  const root = context.root;
  const cwd = options.cwd ? resolve(context.root, options.cwd) : root;

  const shouldBuildApp = !!options.buildTarget;
  const shouldBuildDependencies = !!options.runBuildTargetDependencies;
  const watchMode = getWatchMode(options.watch, shouldBuildApp);

  const inspect =
    options.inspect === true ? InspectType.Inspect : (options.inspect ?? false);

  return {
    ...options,
    projectName,
    root,
    cwd,
    watchMode,
    inspect,
    shouldBuildApp,
    shouldBuildDependencies
  };
}

function getWatchMode(
  watch: RunExecutorOptions['watch'],
  shouldBuildApp: boolean
): NormalizedOptions['watchMode'] {
  return watch === true ? (shouldBuildApp ? 'nx' : 'bun') : (watch ?? false);
}
