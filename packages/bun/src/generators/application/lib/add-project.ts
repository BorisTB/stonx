import { NormalizedOptions } from './normalize-options';
import {
  addProjectConfiguration,
  joinPathFragments,
  ProjectConfiguration,
  Tree,
  writeJson
} from '@nx/devkit';
import { PackageJson } from 'nx/src/utils/package-json';
import { getBuildConfig, getServeConfig } from './create-targets';

export function addProject(
  tree: Tree,
  options: NormalizedOptions,
  appDependencies: Record<string, string> = {}
) {
  const project: ProjectConfiguration = {
    root: options.appProjectRoot,
    sourceRoot: joinPathFragments(options.appProjectRoot, 'src'),
    projectType: 'application',
    targets: {
      build: getBuildConfig(options),
      serve: getServeConfig(options)
    },
    tags: options.parsedTags
  };

  const packageJson: PackageJson = {
    name: options.importPath,
    version: '0.0.1',
    private: true,
    dependencies: { ...appDependencies }
  };

  if (!options.useProjectJson) {
    packageJson.nx = {
      name: options.name !== options.importPath ? options.name : undefined,
      targets: project.targets,
      tags: project.tags?.length ? project.tags : undefined
    };
  } else {
    addProjectConfiguration(
      tree,
      options.name,
      project,
      options.standaloneConfig
    );
  }

  if (!options.useProjectJson || options.isUsingTsSolutionConfig) {
    writeJson(
      tree,
      joinPathFragments(options.appProjectRoot, 'package.json'),
      packageJson
    );
  }
}
