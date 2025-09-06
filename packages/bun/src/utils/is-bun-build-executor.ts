import { libs } from './dependencies';

export function isBunBuildExecutor(executor: string | undefined) {
  return executor === `${libs.plugin.name}:build`;
}
