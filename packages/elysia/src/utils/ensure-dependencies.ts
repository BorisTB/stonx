import {
  GeneratorCallback,
  removeDependenciesFromPackageJson,
  runTasksInSerial,
  Tree
} from '@nx/devkit';
import { addDependenciesToPackageJson } from '@nx/devkit';
import { prodDependencies, devDependencies } from './dependencies';

export function ensureDependencies(
  tree: Tree,
  keepExistingVersions?: boolean
): GeneratorCallback {
  const tasks: GeneratorCallback[] = [];
  tasks.push(
    removeDependenciesFromPackageJson(tree, Object.keys(devDependencies), [])
  );
  tasks.push(
    addDependenciesToPackageJson(
      tree,
      prodDependencies,
      devDependencies,
      undefined,
      keepExistingVersions
    )
  );

  return runTasksInSerial(...tasks);
}
