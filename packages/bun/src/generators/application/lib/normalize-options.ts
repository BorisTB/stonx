import { ApplicationGeneratorOptions } from '../schema';
import { joinPathFragments, names, readNxJson, Tree } from '@nx/devkit';
import {
  determineProjectNameAndRootOptions,
  ensureRootProjectName
} from '@nx/devkit/src/generators/project-name-and-root-utils';
import { isUsingTsSolutionSetup } from '@nx/js/src/utils/typescript/ts-solution-setup';

export interface NormalizedOptions
  extends Omit<ApplicationGeneratorOptions, 'useTsSolution'> {
  name: string;
  appProjectRoot: string;
  port: number;
  parsedTags: string[];
  outputPath: string;
  importPath: string;
  isUsingTsSolutionConfig: boolean;
}

export async function normalizeOptions(
  host: Tree,
  options: ApplicationGeneratorOptions
): Promise<NormalizedOptions> {
  await ensureRootProjectName(options, 'application');
  const {
    projectName,
    projectRoot: appProjectRoot,
    importPath
  } = await determineProjectNameAndRootOptions(host, {
    name: options.name,
    projectType: 'application',
    directory: options.directory,
    rootProject: options.rootProject
  });
  options.rootProject = appProjectRoot === '.';
  options.e2eTestRunner = options.e2eTestRunner ?? 'jest';

  const parsedTags = options.tags
    ? options.tags.split(',').map((s) => s.trim())
    : [];

  const nxJson = readNxJson(host);
  const addPlugin =
    options.addPlugin ??
    (process.env.NX_ADD_PLUGINS !== 'false' &&
      nxJson?.useInferencePlugins !== false);

  const isUsingTsSolutionConfig = isUsingTsSolutionSetup(host);
  const appProjectName =
    !isUsingTsSolutionConfig || options.name ? projectName : importPath;
  const useProjectJson = options.useProjectJson ?? !isUsingTsSolutionConfig;

  return {
    ...options,
    addPlugin,
    name: appProjectName,
    frontendProject: options.frontendProject
      ? names(options.frontendProject).fileName
      : undefined,
    appProjectRoot,
    importPath,
    parsedTags,
    linter: options.linter ?? 'eslint',
    unitTestRunner: options.unitTestRunner ?? 'jest',
    rootProject: options.rootProject ?? false,
    port: options.port ?? 3000,
    outputPath: isUsingTsSolutionConfig
      ? joinPathFragments(appProjectRoot, 'dist')
      : joinPathFragments(
          'dist',
          options.rootProject ? appProjectName : appProjectRoot
        ),
    isUsingTsSolutionConfig,
    useProjectJson
  };
}
