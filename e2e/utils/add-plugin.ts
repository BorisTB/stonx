import { execSync } from 'child_process';

export function addPlugin(projectDirectory: string, pluginName: string) {
  return execSync(`npx nx add @stonx/${pluginName}@e2e`, {
    cwd: projectDirectory,
    stdio: 'inherit',
    env: process.env
  });
}
