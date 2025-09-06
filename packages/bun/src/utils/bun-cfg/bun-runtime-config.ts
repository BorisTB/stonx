import { addFlag, defineConfigArgvMap } from './cfg-to-argv';

export interface BunRuntimeConfig {
  config?: string;
  smol?: boolean;
  bun?: boolean;
}

export const bunRuntimeConfigArgvMap = defineConfigArgvMap<BunRuntimeConfig>({
  config: (v) => [addFlag('--config', v)],
  smol: (v) => [addFlag('--smol', v)],
  bun: (v) => [addFlag('--bun', v)]
});
