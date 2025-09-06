import { cleanup, ensureNxProject } from '@nx/plugin/testing';
import {
  assertPluginInstalled,
  generateStonxApp,
  getProjectDetails,
  installStonxPlugin
} from '@stonx/e2e-utils';

describe('elysia', () => {
  let elysiaApp: string;

  beforeAll(() => {
    ensureNxProject();
    installStonxPlugin('elysia');
  });

  afterAll(() => {
    cleanup();
  });

  describe('setup', () => {
    it('should be installed', () => {
      assertPluginInstalled('elysia');
    });
  });

  describe('application generator', () => {
    beforeAll(() => {
      elysiaApp = generateStonxApp('elysia');
    });

    it('should properly set up project', () => {
      const projectDetails = getProjectDetails(elysiaApp);

      expect(projectDetails).toMatchObject({
        name: elysiaApp,
        root: `apps/${elysiaApp}`,
        sourceRoot: `apps/${elysiaApp}/src`,
        projectType: 'application',
        targets: {
          build: {
            executor: '@nx/esbuild:esbuild',
            outputs: ['{options.outputPath}'],
            defaultConfiguration: 'production',
            options: {
              platform: 'node',
              main: `apps/${elysiaApp}/src/main.ts`,
              tsConfig: `apps/${elysiaApp}/tsconfig.app.json`
            },
            configurations: {
              development: {},
              production: {
                esbuildOptions: {
                  sourcemap: false,
                  outExtension: {
                    '.js': '.js'
                  }
                }
              }
            },
            parallelism: true,
            cache: true,
            dependsOn: ['^build'],
            inputs: ['production', '^production']
          },
          serve: {
            continuous: true,
            executor: '@nx/js:node',
            defaultConfiguration: 'development',
            dependsOn: ['build'],
            options: {
              buildTarget: `${elysiaApp}:build`,
              runBuildTargetDependencies: false
            },
            configurations: {
              development: {
                buildTarget: `${elysiaApp}:build:development`
              },
              production: {
                buildTarget: `${elysiaApp}:build:production`
              }
            },
            parallelism: true
          }
        }
      });
    });
  });
});
