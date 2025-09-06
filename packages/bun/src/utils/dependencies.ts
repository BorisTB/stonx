export interface DependencyDefinition {
  name: string;
  version: string;
}

const packageJson = require('../../package.json');

export const libs = {
  plugin: { name: packageJson.name, version: packageJson.version },
  bunTypes: { name: '@types/bun', version: '^1.2.20' },
  nxElysia: { name: '@stonx/elysia', version: '^0.1.1' }
} as const satisfies Record<string, DependencyDefinition>;

export const workspaceDependencies = {
  [libs.plugin.name]: libs.plugin.version,
  [libs.bunTypes.name]: libs.bunTypes.version
} as const;
