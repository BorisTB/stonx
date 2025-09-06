import { joinPathFragments, TargetConfiguration } from '@nx/devkit';
import { NormalizedOptions } from './normalize-options';
import { libs } from '../../../utils';
import { BuildExecutorOptions } from '../../../executors/build/schema';
import { InspectType, RunExecutorOptions } from '../../../executors/run/schema';

export function getBuildConfig(
  options: NormalizedOptions
): TargetConfiguration<BuildExecutorOptions> {
  return {
    executor: `${libs.plugin.name}:build`,
    inputs: ['production', '^production'],
    outputs: ['{options.outputPath}'],
    dependsOn: ['^build'],
    defaultConfiguration: 'production',
    options: {
      main: joinPathFragments(options.appProjectRoot, 'src', 'main.ts'),
      outputPath: options.outputPath,
      tsConfig: joinPathFragments(options.appProjectRoot, 'tsconfig.app.json'),
      smol: false,
      bun: true
    },
    configurations: {
      development: {},
      production: {}
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
    options: {
      main: joinPathFragments(options.appProjectRoot, 'src', 'main.ts'),
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
      development: {},
      production: {
        buildTarget: `${options.name}:build:production`
      }
    }
  };
}
