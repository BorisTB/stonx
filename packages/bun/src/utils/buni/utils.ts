export function isBunRuntime(): boolean {
  return typeof Bun !== 'undefined';
}

export function getBunCmd(): string {
  return process.env.BUN_BIN || 'bun';
}

export function isBunSubprocess(
  spawnResult: unknown
): spawnResult is Bun.Subprocess {
  return (
    !!spawnResult &&
    isBunRuntime() &&
    typeof spawnResult === 'object' &&
    'exited' in spawnResult
  );
}
