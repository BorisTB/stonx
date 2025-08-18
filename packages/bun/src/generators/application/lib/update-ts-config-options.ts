import { Tree, updateJson } from '@nx/devkit';
import { NormalizedOptions } from './normalize-options';
import { tsConfigBaseOptions } from '@nx/js';

export function updateTsConfigOptions(tree: Tree, options: NormalizedOptions) {
  if (options.isUsingTsSolutionConfig) {
    return;
  }

  updateJson(tree, `${options.appProjectRoot}/tsconfig.json`, (json) => {
    if (options.rootProject) {
      return {
        compilerOptions: {
          ...tsConfigBaseOptions,
          ...json.compilerOptions,
          esModuleInterop: true
        },
        ...json,
        extends: undefined,
        exclude: ['node_modules', 'tmp']
      };
    } else {
      return {
        ...json,
        compilerOptions: {
          ...json.compilerOptions,
          esModuleInterop: true
        }
      };
    }
  });
}
