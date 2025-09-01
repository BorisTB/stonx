/* Test helpers to mock runtime and process APIs for universal spawn */
import * as childProc from 'node:child_process';

// Allow mutable import for mocking
let originalIsBunRuntime: any;
let originalBunSpawn: any;
let originalChildSpawn: any;

export function mockIsBunRuntime(modulePath: string, value: boolean) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require(modulePath);
  if (originalIsBunRuntime === undefined) {
    originalIsBunRuntime = mod.isBunRuntime;
  }
  mod.isBunRuntime = () => value;
}

export function restoreIsBunRuntime(modulePath: string) {
  if (originalIsBunRuntime === undefined) return;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require(modulePath);
  mod.isBunRuntime = originalIsBunRuntime;
  originalIsBunRuntime = undefined;
}

export function mockBunSpawn(impl: (opts: any) => any) {
  // Create global Bun if not present
  // @ts-ignore
  if (typeof globalThis.Bun === 'undefined') {
    // @ts-ignore
    globalThis.Bun = {} as any;
  }
  // @ts-ignore
  if (originalBunSpawn === undefined) originalBunSpawn = globalThis.Bun.spawn;
  // @ts-ignore
  globalThis.Bun.spawn = impl as any;
}

export function restoreBunSpawn() {
  // @ts-ignore
  if (originalBunSpawn !== undefined) globalThis.Bun.spawn = originalBunSpawn;
  originalBunSpawn = undefined;
}

export function mockNodeSpawn(impl: typeof childProc.spawn) {
  if (originalChildSpawn === undefined) originalChildSpawn = childProc.spawn;
  // @ts-ignore
  childProc.spawn = impl as any;
}

export function restoreNodeSpawn() {
  if (originalChildSpawn !== undefined) {
    // @ts-ignore
    childProc.spawn = originalChildSpawn;
  }
  originalChildSpawn = undefined;
}
