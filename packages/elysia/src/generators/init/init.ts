import { GeneratorCallback, runTasksInSerial, Tree } from '@nx/devkit';
import { formatFiles } from '@nx/devkit';
import type { InitGeneratorOptions } from './schema';
import { ensureDependencies } from '../../utils/ensure-dependencies';

export async function initGenerator(
  tree: Tree,
  options: InitGeneratorOptions
): Promise<GeneratorCallback> {
  const tasks: GeneratorCallback[] = [];

  if (!options.skipPackageJson) {
    tasks.push(ensureDependencies(tree, options.keepExistingVersions));
  }

  if (!options.skipFormat) {
    await formatFiles(tree);
  }

  return runTasksInSerial(...tasks);
}

export default initGenerator;
