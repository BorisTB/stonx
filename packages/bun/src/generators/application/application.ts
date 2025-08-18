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

  if (options.framework === 'elysia') {
    const { applicationGenerator } = ensurePackage(
      libs.nxElysia.name,
      libs.nxElysia.version
    );
    const elysiaTask = await applicationGenerator(tree, {
      ...options,
      skipFormat: true
    });
    tasks.push(elysiaTask);

    return runTasksInSerial(
      ...[
        ...tasks,
        () => {
          logShowProjectCommand(options.name);
        }
      ]
    );
  }

  const initTask = await initGenerator(tree, {
    ...options,
    skipFormat: true
  });
  tasks.push(initTask);

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
        module: 'nodenext',
        moduleResolution: 'nodenext'
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

  tasks.push(() => {
    logShowProjectCommand(options.name);
  });

  return runTasksInSerial(...tasks);
}

export default applicationGenerator;
