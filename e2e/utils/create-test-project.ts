import { join, dirname } from 'path';
import { mkdirSync, rmSync } from 'fs';
import { execSync } from 'child_process';

/**
 * Creates a test project with create-nx-workspace and installs the plugin
 * @returns The directory where the test project was created
 */
export function createTestProject(projectName = 'test-project') {
  const projectDirectory = join(process.cwd(), 'tmp', 'nx-e2e', projectName);

  // Ensure projectDirectory is empty
  rmSync(projectDirectory, {
    recursive: true,
    force: true
  });
  mkdirSync(dirname(projectDirectory), {
    recursive: true
  });

  execSync(
    `pnpm dlx create-nx-workspace@latest ${projectName} --preset apps --nxCloud=skip --no-interactive`,
    {
      cwd: dirname(projectDirectory),
      stdio: 'inherit',
      env: process.env
    }
  );

  console.log(`Created test project in "${projectDirectory}"`);

  return projectDirectory;
}
