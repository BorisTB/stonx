import {
  logger,
  readProjectConfiguration,
  Tree,
  updateProjectConfiguration
} from '@nx/devkit';
import { NormalizedOptions } from './normalize-options';

export function addProxy(tree: Tree, options: NormalizedOptions) {
  if (!options.frontendProject) {
    return;
  }

  const projectConfig = readProjectConfiguration(tree, options.frontendProject);
  const serveTargetName = ['serve', 'dev'].find(
    (t) => !!projectConfig.targets?.[t]
  );

  if (projectConfig.targets && serveTargetName) {
    projectConfig.targets[serveTargetName].dependsOn = [
      ...(projectConfig.targets[serveTargetName].dependsOn ?? []),
      `${options.name}:serve`
    ];

    const pathToProxyFile = `${projectConfig.root}/proxy.conf.json`;
    projectConfig.targets[serveTargetName].options = {
      ...projectConfig.targets[serveTargetName].options,
      proxyConfig: pathToProxyFile
    };

    if (!tree.exists(pathToProxyFile)) {
      tree.write(
        pathToProxyFile,
        JSON.stringify(
          {
            '/api': {
              target: `http://localhost:${options.port}`,
              secure: false
            }
          },
          null,
          2
        )
      );
    } else {
      //add new entry to existing config
      const proxyFileContent = tree.read(pathToProxyFile)?.toString();

      if (proxyFileContent) {
        const proxyModified = {
          ...JSON.parse(proxyFileContent),
          [`/${options.name}-api`]: {
            target: `http://localhost:${options.port}`,
            secure: false
          }
        };

        tree.write(pathToProxyFile, JSON.stringify(proxyModified, null, 2));
      }
    }

    updateProjectConfiguration(tree, options.frontendProject, projectConfig);
  } else {
    logger.warn(
      `Skip updating proxy for frontend project "${options.frontendProject}" since "serve" target is not found in project.json. For more information, see: https://nx.dev/recipes/node/application-proxies.`
    );
  }
}
