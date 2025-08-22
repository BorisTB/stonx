export type BuildMinifyConfig =
  | boolean
  | {
      whitespace?: boolean;
      syntax?: boolean;
      identifiers?: boolean;
    };

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
  sourcemap?: boolean | 'none' | 'linked' | 'inline' | 'external';
  minify?: BuildMinifyConfig;
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
  cwd?: string;
}

export interface NormalizedBuildExecutorOptions extends BuildExecutorOptions {
  rootDir: string;
  projectRoot: string;
  mainOutputPath: string;
  generatePackageJson: boolean;
  root?: string;
  sourceRoot?: string;
  sourcemap?: Exclude<BuildExecutorOptions['sourcemap'], boolean>;
  splitting: boolean;
}
