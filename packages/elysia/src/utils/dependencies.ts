export interface DependencyDefinition {
  name: string;
  version: string;
}

const packageJson = require('../../package.json');

export const libs = {
  plugin: { name: packageJson.name, version: packageJson.version },
  elysia: { name: 'elysia', version: '^1.3.8' },
  elysiaJsNode: { name: '@elysiajs/node', version: '^1.3.0' }
} as const satisfies Record<string, DependencyDefinition>;

export const prodDependencies = {
  [libs.elysia.name]: libs.elysia.version,
  [libs.elysiaJsNode.name]: libs.elysiaJsNode.version
} as const;

export const devDependencies = {
  [libs.plugin.name]: libs.plugin.version
} as const;
