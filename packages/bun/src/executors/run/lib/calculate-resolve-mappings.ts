import {
  ExecutorContext,
  joinPathFragments,
  parseTargetString
} from '@nx/devkit';
import { NodeExecutorOptions } from '../schema';
import {
  calculateProjectBuildableDependencies,
  DependentBuildableProjectNode
} from '@nx/js/src/utils/buildable-libs-utils';

export function calculateResolveMappings(
  context: ExecutorContext,
  options: NodeExecutorOptions
) {
  const parsed = parseTargetString(options.buildTarget, context);
  const { dependencies } = calculateProjectBuildableDependencies(
    context.taskGraph,
    context.projectGraph,
    context.root,
    parsed.project,
    parsed.target,
    parsed.configuration || ''
  );
  return dependencies.reduce<
    Record<DependentBuildableProjectNode['name'], string>
  >((m, c) => {
    if (c.node.type !== 'npm' && c.outputs[0] != null) {
      m[c.name] = joinPathFragments(context.root, c.outputs[0]);
    }
    return m;
  }, {});
}
