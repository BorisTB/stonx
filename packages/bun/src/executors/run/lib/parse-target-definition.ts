import {
  ExecutorContext,
  parseTargetString,
  readTargetOptions,
  Target
} from '@nx/devkit';

export function parseTargetDefinition(
  targetName: string | undefined,
  targetOptionsDef: Record<string, any> = {},
  context: ExecutorContext
): { target: Target | null; targetOptions: Record<string, unknown> | null } {
  if (!targetName) {
    return { target: null, targetOptions: null };
  }

  const target = parseTargetString(targetName, context);

  return {
    target,
    targetOptions: {
      ...readTargetOptions(target, context),
      ...targetOptionsDef,
      target: target.target
    }
  };
}
