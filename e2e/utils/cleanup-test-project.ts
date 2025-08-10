import { rmSync } from 'fs';

export function cleanupTestProject(projectDirectory: string) {
  if (!projectDirectory) {
    return;
  }

  rmSync(projectDirectory, {
    recursive: true,
    force: true
  });
}
