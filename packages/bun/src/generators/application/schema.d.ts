import type { Linter, LinterType } from '@nx/eslint';

export interface ApplicationGeneratorOptions {
  directory: string;
  name?: string;
  skipFormat?: boolean;
  skipPackageJson?: boolean;
  unitTestRunner?: 'jest' | 'none';
  e2eTestRunner?: 'jest' | 'none';
  linter?: Linter | LinterType;
  formatter?: 'none' | 'prettier';
  tags?: string;
  frontendProject?: string;
  js?: boolean;
  setParserOptionsProject?: boolean;
  standaloneConfig?: boolean;
  framework?: BunFrameWorks;
  port?: number;
  rootProject?: boolean;
  docker?: boolean;
  skipDockerPlugin?: boolean;
  addPlugin?: boolean;
  useTsSolution?: boolean;
  useProjectJson?: boolean;
}

export type BunFrameWorks = 'elysia' | 'none';
