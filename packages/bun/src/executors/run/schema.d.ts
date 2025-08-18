export interface RunExecutorOptions {
  buildTarget: string;
  buildTargetOptions?: Record<string, unknown>;
  watch?: boolean;
  hot?: boolean;
  debounce?: number;
  config?: string;
  tsConfig?: string;
  smol?: boolean;
  bun?: boolean;
  runBuildTargetDependencies?: boolean;
  waitUntilTargets: string[];
}

export const enum InspectType {
  Inspect = 'inspect',
  InspectBrk = 'inspect-brk'
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
