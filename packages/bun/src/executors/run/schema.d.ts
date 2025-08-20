export type WatchMode = boolean | 'nx' | 'bun';

export const enum InspectType {
  Inspect = 'inspect',
  InspectBrk = 'inspect-brk'
}

export interface RunExecutorOptions {
  main?: string;
  buildTarget?: string;
  buildTargetOptions?: Record<string, unknown>;
  runtimeArgs: string[];
  args: string[];
  watch?: WatchMode;
  hot?: boolean;
  inspect: boolean | InspectType;
  debounce?: number; // TODO: add to schema
  config?: string;
  tsConfig?: string;
  tsConfigOverride?: string;
  smol?: boolean;
  bun?: boolean;
  runBuildTargetDependencies?: boolean;
  waitUntilTargets: string[];
  cwd?: string;
}

export interface NormalizedRunExecutorOptions
  extends Omit<RunExecutorOptions, 'inspect'> {
  projectName: string;
  root: string;
  cwd: string;
  watchMode: Exclude<WatchMode, true>;
  inspect: false | InspectType;
  shouldBuildApp: boolean;
  shouldBuildDependencies: boolean;
}
