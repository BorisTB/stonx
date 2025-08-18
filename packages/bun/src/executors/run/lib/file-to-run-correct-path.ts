import { fileExists } from 'nx/src/utils/fileutils';

export function fileToRunCorrectPath(fileToRun: string): string {
  if (fileExists(fileToRun)) {
    return fileToRun;
  }

  const extensionsToTry = ['.cjs', '.mjs', '.cjs.js', '.esm.js'];

  for (const ext of extensionsToTry) {
    const file = fileToRun.replace(/\.js$/, ext);
    if (fileExists(file)) return file;
  }

  throw new Error(
    `Could not find ${fileToRun}. Make sure your build succeeded.`
  );
}
