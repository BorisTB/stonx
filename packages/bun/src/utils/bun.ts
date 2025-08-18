import { universalSpawnSync } from './cli';

export async function getBunVersion(): Promise<string | null> {
  try {
    return await universalSpawnSync('bun --version');
  } catch (error) {
    console.error(`Failed to retrieve the version for bun.`);
    return null;
  }
}

export async function isBunAvailable(): Promise<boolean> {
  const bunVersion = await getBunVersion();
  return !!bunVersion;
}
