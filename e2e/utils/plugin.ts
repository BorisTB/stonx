import {
  runCommand,
  runNxCommand,
  tmpProjPath,
  uniq
} from '@nx/plugin/testing';
import {
  detectPackageManager,
  getPackageManagerCommand,
  PackageManagerCommands
} from 'nx/src/utils/package-manager';

export function installStonxPlugin(name: string, version = 'e2e') {
  return runNxCommand(`add @stonx/${name}@${version}`);
}

export function generateStonxApp(pluginName: string, args?: string): string {
  const appName: string = uniq(`${pluginName}app`);
  runNxCommand(
    `g @stonx/${pluginName}:application apps/${appName} --linter none --unitTestRunner none --e2eTestRunner none${args ? ` ${args}` : ''}`
  );

  return appName;
}

export function getPackageManagerCommands(): PackageManagerCommands {
  return getPackageManagerCommand(detectPackageManager(tmpProjPath()));
}

export function assertPluginInstalled(pluginName: string): string {
  const pm = getPackageManagerCommands();
  return runCommand(`${pm.list} @stonx/${pluginName}`, {});
}

export function getProjectDetails(projectName: string) {
  return JSON.parse(runNxCommand(`show project ${projectName} --json`));
}
