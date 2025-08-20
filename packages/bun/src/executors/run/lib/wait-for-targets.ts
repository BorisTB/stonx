import { ExecutorContext, parseTargetString, runExecutor } from '@nx/devkit';
import { firstValueFrom } from './first-value-from';

export async function waitForTargets(
  targets: string[],
  context: ExecutorContext
): Promise<{ success: boolean }[]> {
  return Promise.all(
    targets.map(async (targetString) => {
      const target = parseTargetString(targetString, context);
      const output = await runExecutor(target, {}, context);
      return await firstValueFrom(output);
    })
  );
}
