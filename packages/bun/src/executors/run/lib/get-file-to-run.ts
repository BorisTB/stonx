import { ExecutorContext, logger, ProjectGraphProjectNode } from '@nx/devkit';
import { join } from 'node:path';
import { interpolate } from 'nx/src/tasks-runner/utils';
import { changeFilePathExtension } from './change-file-path-extension';
import { getRelativePath } from './get-relative-path';

function getFileName(
  main: string | undefined,
  buildOptions: Record<string, any> = {}
): string {
  if (main) {
    return changeFilePathExtension(main, 'js', { fromExt: 'ts' });
  }

  if (buildOptions.outputFileName) {
    return buildOptions.outputFileName;
  }

  if (buildOptions.main) {
    return changeFilePathExtension(buildOptions.main, 'js', { fromExt: 'ts' });
  }

  return 'main.js';
}

export function getFileToRun(
  context: ExecutorContext,
  project: ProjectGraphProjectNode,
  buildOptions: Record<string, any>,
  buildTargetExecutor?: string,
  main?: string
): string {
  const fileName = getFileName(main, buildOptions);

  if (!buildOptions?.outputPath && !buildOptions?.outputFileName) {
    const outputPath =
      project.data.targets?.[buildOptions.target]?.outputs?.[0];

    if (outputPath) {
      const outputFilePath = interpolate(outputPath, {
        projectName: project.name,
        projectRoot: project.data.root,
        workspaceRoot: context.root
      });
      return join(outputFilePath, fileName);
    }
    const fallbackFile = join('dist', project.data.root, fileName);

    logger.warn(
      `Build option outputFileName not set for ${project.name}. Using fallback value of ${fallbackFile}.`
    );

    return join(context.root, fallbackFile);
  }

  const outputFileName = getRelativePath(project.data.root, fileName);

  return join(context.root, buildOptions.outputPath, outputFileName);
}
