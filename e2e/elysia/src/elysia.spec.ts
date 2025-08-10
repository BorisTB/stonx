import { execSync } from 'child_process';
import {
  addPlugin,
  cleanupTestProject,
  createTestProject
} from '@stonx/e2e-utils';

describe('elysia', () => {
  let projectDirectory: string;

  beforeAll(() => {
    projectDirectory = createTestProject();
    addPlugin(projectDirectory, 'elysia');
  });

  afterAll(() => {
    cleanupTestProject(projectDirectory);
  });

  it('should be installed', () => {
    // npm ls will fail if the package is not installed properly
    execSync('pnpm ls --depth 100 @stonx/elysia', {
      cwd: projectDirectory,
      stdio: 'inherit'
    });
  });

  describe('application generator', () => {
    beforeAll(() => {
      execSync(
        'npx nx g @stonx/elysia:application my-app --linter none --unitTestRunner none --e2eTestRunner none',
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
            executor: '@nx/esbuild:esbuild',
            outputs: ['{options.outputPath}'],
            defaultConfiguration: 'production',
            options: {
              platform: 'node',
              main: 'my-app/src/main.ts',
              tsConfig: 'my-app/tsconfig.app.json'
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
              buildTarget: 'my-app:build',
              runBuildTargetDependencies: false
            },
            configurations: {
              development: {
                buildTarget: 'my-app:build:development'
              },
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
