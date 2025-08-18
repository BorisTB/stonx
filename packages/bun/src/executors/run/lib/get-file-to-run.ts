import { ExecutorContext, logger, ProjectGraphProjectNode } from '@nx/devkit';
import path from 'node:path';
import { getRelativeDirectoryToProjectRoot } from '@nx/js/src/utils/get-main-file-dir';
import { interpolate } from 'nx/src/tasks-runner/utils';

export function getFileToRun(
  context: ExecutorContext,
  project: ProjectGraphProjectNode,
  buildOptions: Record<string, any>,
  buildTargetExecutor?: string
): string {
  if (!buildOptions?.outputPath && !buildOptions?.outputFileName) {
    const outputPath =
      project.data.targets?.[buildOptions.target]?.outputs?.[0];

    if (outputPath) {
      const outputFilePath = interpolate(outputPath, {
        projectName: project.name,
        projectRoot: project.data.root,
        workspaceRoot: context.root
      });
      return path.join(outputFilePath, 'main.js');
    }
    const fallbackFile = path.join('dist', project.data.root, 'main.js');

    logger.warn(
      `Build option outputFileName not set for ${project.name}. Using fallback value of ${fallbackFile}.`
    );

    return path.join(context.root, fallbackFile);
  }

  let outputFileName = buildOptions.outputFileName;

  if (!outputFileName) {
    const fileName = `${path.parse(buildOptions.main).name}.js`;
    if (
      buildTargetExecutor === '@nx/js:tsc' ||
      buildTargetExecutor === '@nx/js:swc'
    ) {
      outputFileName = path.join(
        getRelativeDirectoryToProjectRoot(buildOptions.main, project.data.root),
        fileName
      );
    } else {
      outputFileName = fileName;
    }
  }

  return path.join(context.root, buildOptions.outputPath, outputFileName);
}
