import { ExecutorContext, joinPathFragments, Target } from '@nx/devkit';
import {
  calculateProjectBuildableDependencies,
  DependentBuildableProjectNode
} from '@nx/js/src/utils/buildable-libs-utils';

export function calculateResolveMappings(
  target: Target,
  context: ExecutorContext
): Record<string, string> {
  const { dependencies } = calculateProjectBuildableDependencies(
    context.taskGraph,
    context.projectGraph,
    context.root,
    target.project,
    target.target,
    target.configuration || ''
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
