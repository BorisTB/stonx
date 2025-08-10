import { execSync } from 'child_process';

export function installPlugin(projectDirectory: string, pluginName: string) {
  return execSync(`pnpm add -D @stonx/${pluginName}@e2e`, {
    cwd: projectDirectory,
    stdio: 'inherit',
    env: process.env
  });
}
