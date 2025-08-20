import { ExecutorContext, Target } from '@nx/devkit';
import { join } from 'node:path';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { calculateResolveMappings } from './calculate-resolve-mappings';

export function writeRuntimeTsconfigOverride(
  projectName: string,
  buildTarget: Target,
  root: string,
  context: ExecutorContext
) {
  const paths = calculateResolveMappings(buildTarget, context);

  const outDir = join(root, 'node_modules/.cache/@stonx/bun');
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  const file = join(outDir, `${projectName}-runtime.tsconfig.json`);
  const json = {
    compilerOptions: {
      baseUrl: '.',
      paths
    }
  };
  writeFileSync(file, JSON.stringify(json, null, 2));
  return file;
}
