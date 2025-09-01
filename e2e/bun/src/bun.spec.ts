import { execSync } from 'child_process';
import {
  cleanupTestProject,
  createTestProject,
  installPlugin
} from '@stonx/e2e-utils';

describe('bun', () => {
  let projectDirectory: string;

  beforeAll(() => {
    projectDirectory = createTestProject();
    installPlugin(projectDirectory, 'bun');
  });

  afterAll(() => {
    cleanupTestProject(projectDirectory);
  });

  it('should be installed', () => {
    // npm ls will fail if the package is not installed properly
    execSync('pnpm ls --depth 100 @stonx/bun', {
      cwd: projectDirectory,
      stdio: 'inherit'
    });
  });

  describe('application generator', () => {
    beforeAll(() => {
      execSync(
        'npx nx g @stonx/bun:application my-app --linter none --unitTestRunner none --e2eTestRunner none --framework none',
        {
          cwd: projectDirectory,
          stdio: 'inherit',
          env: process.env
        }
      );
    });

    it('should infer tasks', () => {
      const projectDetails = JSON.parse(
        execSync('nx show project my-app --json', {
          cwd: projectDirectory
        }).toString()
      );

      expect(projectDetails).toMatchObject({
        name: 'my-app',
        root: 'my-app',
        sourceRoot: 'my-app/src',
        projectType: 'application',
        targets: {
          build: {
            executor: '@stonx/bun:build',
            inputs: ['production', '^production'],
            outputs: ['{options.outputPath}'],
            defaultConfiguration: 'production',
            options: {
              main: 'my-app/src/main.ts',
              tsConfig: 'my-app/tsconfig.app.json',
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
                buildTarget: 'my-app:build:production'
              }
            },
            parallelism: true
          }
        }
      });
    });
  });
});
