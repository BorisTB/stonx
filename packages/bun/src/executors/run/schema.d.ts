export type WatchMode = boolean | 'nx' | 'bun';

export enum InspectType {
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

export interface NodeExecutorOptions {
  inspect: boolean | InspectType;
  runtimeArgs: string[];
  args: string[];
  waitUntilTargets: string[];
  buildTarget: string;
  buildTargetOptions: Record<string, any>;
  host: string;
  port: number;
  watch?: boolean;
  debounce?: number;
  runBuildTargetDependencies?: boolean;
}
