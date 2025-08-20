export interface BuildExecutorOptions {
  main: string;
  outputPath: string;
  additionalEntryPoints?: string[];
  tsConfig: string;
  rootDir?: string;
  outputFileName?: string;
  watch?: boolean;
  config?: string;
  smol?: boolean;
  bun?: boolean;
  clean?: boolean;
  target?: 'bun' | 'node' | 'browser';
  format?: 'esm' | 'cjs' | 'iife';
  splitting?: boolean;
  env?: 'inline' | 'disable' | `${string}*` | undefined;
  sourcemap?: 'none' | 'linked' | 'external';
  minify?: boolean;
  external?: 'all' | 'none' | string[];
  packages?: 'bundle' | 'external';
  naming?: string;
  publicPath?: string;
  define?: Record<string, string>;
  loader?: Record<string, Bun.Loader>;
  banner?: string;
  footer?: string;
  drop?: string[];
  generateLockfile?: boolean;
  generatePackageJson?: boolean;
}

export interface NormalizedBuildExecutorOptions extends BuildExecutorOptions {
  rootDir: string;
  projectRoot: string;
  mainOutputPath: string;
  generatePackageJson: boolean;
  root?: string;
  sourceRoot?: string;
}
