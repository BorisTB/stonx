import {
  GeneratorCallback,
  removeDependenciesFromPackageJson,
  runTasksInSerial,
  Tree
} from '@nx/devkit';
import { addDependenciesToPackageJson } from '@nx/devkit';
import { workspaceDependencies } from '../../../utils';

export function ensureDependencies(
  tree: Tree,
  keepExistingVersions?: boolean
): GeneratorCallback {
  const tasks: GeneratorCallback[] = [];
  tasks.push(
    removeDependenciesFromPackageJson(
      tree,
      Object.keys(workspaceDependencies),
      []
    )
  );
  tasks.push(
    addDependenciesToPackageJson(
      tree,
      {},
      workspaceDependencies,
      undefined,
      keepExistingVersions
    )
  );

  return runTasksInSerial(...tasks);
}
