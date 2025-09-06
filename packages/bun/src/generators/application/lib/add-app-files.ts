import { NormalizedOptions } from './normalize-options';
import {
  generateFiles,
  joinPathFragments,
  offsetFromRoot,
  Tree
} from '@nx/devkit';
import { getRelativePathToRootTsConfig } from '@nx/js';

export function addAppFiles(tree: Tree, options: NormalizedOptions) {
  generateFiles(
    tree,
    joinPathFragments(__dirname, '../files'),
    options.appProjectRoot,
    {
      ...options,
      tmpl: '',
      name: options.name,
      root: options.appProjectRoot,
      offsetFromRoot: offsetFromRoot(options.appProjectRoot),
      rootTsConfigPath: getRelativePathToRootTsConfig(
        tree,
        options.appProjectRoot
      )
    }
  );
}
