import {
  joinPathFragments,
  ProjectConfiguration,
  TargetConfiguration,
  Tree
} from '@nx/devkit';
import { NormalizedOptions } from './normalize-options';
import { libs } from '../../../utils';
import { BuildExecutorOptions } from '../../../executors/build/schema';
import { InspectType, RunExecutorOptions } from '../../../executors/run/schema';

export function getBuildConfig(
  options: NormalizedOptions
): TargetConfiguration<BuildExecutorOptions> {
  return {
    executor: `${libs.plugin.name}:build`,
    outputs: ['{options.outputPath}'],
    options: {
      main: joinPathFragments(options.appProjectRoot, 'src', 'main.ts'),
      outputPath: options.outputPath,
      tsConfig: joinPathFragments(options.appProjectRoot, 'tsconfig.app.json'),
      smol: false,
      bun: true
    }
  };
}

export function getServeConfig(
  options: NormalizedOptions
): TargetConfiguration<RunExecutorOptions> {
  return {
    continuous: true,
    executor: `${libs.plugin.name}:run`,
    defaultConfiguration: 'development',
    dependsOn: ['build'],
    options: {
      buildTarget: `${options.name}:build`,
      tsConfig: joinPathFragments(options.appProjectRoot, 'tsconfig.app.json'),
      watch: true,
      hot: true,
      bun: true,
      smol: false,
      runBuildTargetDependencies: false,
      waitUntilTargets: [],
      runtimeArgs: [],
      args: [],
      inspect: InspectType.Inspect
    },
    configurations: {
      development: {
        buildTarget: `${options.name}:build:development`
      },
      production: {
        buildTarget: `${options.name}:build:production`
      }
    }
  };
}

export function createTargets(
  tree: Tree,
  project: ProjectConfiguration,
  options: NormalizedOptions
) {}
