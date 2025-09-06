import { cleanup, ensureNxProject } from '@nx/plugin/testing';
import {
  assertPluginInstalled,
  generateStonxApp,
  getProjectDetails,
  installStonxPlugin
} from '@stonx/e2e-utils';

describe('bun', () => {
  let bunApp: string;

  beforeAll(() => {
    ensureNxProject();
    installStonxPlugin('bun');
  });

  afterAll(() => {
    cleanup();
  });

  describe('setup', () => {
    it('should be installed', () => {
      assertPluginInstalled('bun');
    });
  });

  describe('application generator', () => {
    beforeAll(() => {
      bunApp = generateStonxApp('bun', '--framework none');
    });

    it('should properly set up project', () => {
      const projectDetails = getProjectDetails(bunApp);

      expect(projectDetails).toMatchObject({
        name: bunApp,
        root: `apps/${bunApp}`,
        sourceRoot: `apps/${bunApp}/src`,
        projectType: 'application',
        targets: {
          build: {
            executor: '@stonx/bun:build',
            inputs: ['production', '^production'],
            outputs: ['{options.outputPath}'],
            defaultConfiguration: 'production',
            options: {
              main: `apps/${bunApp}/src/main.ts`,
              tsConfig: `apps/${bunApp}/tsconfig.app.json`,
              smol: false,
              bun: true
            },
            configurations: {
              development: {},
              production: {}
            },
            dependsOn: ['^build']
          },
          serve: {
            continuous: true,
            executor: '@stonx/bun:run',
            defaultConfiguration: 'development',
            options: {
              runBuildTargetDependencies: false
            },
            configurations: {
              development: {},
              production: {
                buildTarget: `${bunApp}:build:production`
              }
            },
            parallelism: true
          }
        }
      });
    });
  });
});
