import {
  ensurePackage,
  formatFiles,
  GeneratorCallback,
  runTasksInSerial,
  Tree,
  updateTsConfigsToJs
} from '@nx/devkit';
import { ApplicationGeneratorOptions } from './schema';
import {
  addAppFiles,
  addProject,
  addProxy,
  normalizeOptions,
  updateTsConfigOptions
} from './lib';
import { libs } from '../../utils';
import { logShowProjectCommand } from '@nx/devkit/src/utils/log-show-project-command';
import initGenerator from '../init/init';
import {
  addProjectToTsSolutionWorkspace,
  updateTsconfigFiles
} from '@nx/js/src/utils/typescript/ts-solution-setup';
import { sortPackageJsonFields } from '@nx/js/src/utils/package-json/sort-fields';

export async function applicationGenerator(
  tree: Tree,
  _options: ApplicationGeneratorOptions
) {
  const tasks: GeneratorCallback[] = [];
  const options = await normalizeOptions(tree, _options);

  const logShowProjectCmdTask = () => {
    logShowProjectCommand(options.name);
  };

  if (options.framework === 'elysia') {
    const { applicationGenerator } = ensurePackage(
      libs.nxElysia.name,
      libs.nxElysia.version
    );

    tasks.push(
      await applicationGenerator(tree, {
        ...options,
        skipFormat: true
      })
    );

    tasks.push(logShowProjectCmdTask);

    return runTasksInSerial(...tasks);
  }

  tasks.push(
    await initGenerator(tree, {
      ...options,
      skipFormat: true
    })
  );

  addAppFiles(tree, options);
  addProject(tree, options);

  if (options.isUsingTsSolutionConfig) {
    await addProjectToTsSolutionWorkspace(tree, options.appProjectRoot);
  }

  updateTsConfigOptions(tree, options);

  if (options.js) {
    updateTsConfigsToJs(tree, { projectRoot: options.appProjectRoot });
  }

  if (options.frontendProject) {
    addProxy(tree, options);
  }

  if (options.isUsingTsSolutionConfig) {
    updateTsconfigFiles(
      tree,
      options.appProjectRoot,
      'tsconfig.app.json',
      {
        // Environment setup & latest features
        lib: ['ESNext'],
        target: 'ESNext',
        module: 'Preserve',
        moduleDetection: 'force',

        // Bundler mode
        moduleResolution: 'bundler',
        allowImportingTsExtensions: true,
        verbatimModuleSyntax: true,
        noEmit: true,

        // Best practices
        strict: true,
        skipLibCheck: true,
        noFallthroughCasesInSwitch: true,
        noUncheckedIndexedAccess: true,
        noImplicitOverride: true,

        // Some stricter flags (disabled by default)
        noUnusedLocals: false,
        noUnusedParameters: false,
        noPropertyAccessFromIndexSignature: false
      },
      options.linter === 'eslint'
        ? ['eslint.config.js', 'eslint.config.cjs', 'eslint.config.mjs']
        : undefined
    );
  }

  sortPackageJsonFields(tree, options.appProjectRoot);

  if (!options.skipFormat) {
    await formatFiles(tree);
  }

  tasks.push(logShowProjectCmdTask);

  return runTasksInSerial(...tasks);
}

export default applicationGenerator;
