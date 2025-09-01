import { ExecutorContext, logger } from '@nx/devkit';
import { BuildExecutorOptions } from './schema';
import { createAsyncIterable } from '@nx/devkit/src/utils/async-iterable';
import { parentPort } from 'node:worker_threads';
import {
  getBunVersion,
  isBun,
  isBunSubprocess,
  spawnWithBun
} from '../../utils';
import { getBunBuildArgv, getBunBuildConfig, normalizeOptions } from './lib';

export interface BunBuildResult {
  success: boolean;
  outfile: string;
}

async function* buildExecutor(
  _options: BuildExecutorOptions,
  context: ExecutorContext
): AsyncGenerator<BunBuildResult> {
  const bunVersion = await getBunVersion();

  if (!bunVersion) {
    throw new Error(`bun command not found. Make sure the bun is available`);
  }

  process.env.NODE_ENV ??= context?.configurationName ?? 'development';

  const project = context.projectGraph.nodes[context.projectName!];
  const { sourceRoot, root } = project.data;
  const options = normalizeOptions(_options, context, sourceRoot, root);

  // const cwd = options.cwd ? resolve(context.root, options.cwd) : context.root;

  const getResult = (success: boolean): BunBuildResult => ({
    success,
    outfile: options.mainOutputPath
  });

  if (isBun) {
    const config = getBunBuildConfig(options);
    const result = await Bun.build(config);
    for (const log of result.logs) {
      console.log(log);
    }
    if (result.success) {
      const outputTextAsync = result.outputs.flatMap((res) => res.text());
      const outputText = await Promise.all(outputTextAsync);
      outputText.forEach((out) => console.log(out));
      console.log(`Build completed for  ${context.projectName}`);
      yield getResult(true);
    } else {
      yield getResult(false);
    }
  } else {
    const args = getBunBuildArgv(options);
    yield* createAsyncIterable<BunBuildResult>(async ({ next, done }) => {
      const childProcess = spawnWithBun(args, {
        stdio: 'inherit'
      });

      if (isBunSubprocess(childProcess)) {
        const stderrReader = childProcess.stderr?.getReader();

        const handleStderr = async () => {
          if (!stderrReader) {
            return;
          }

          try {
            while (true) {
              const { done, value } = await stderrReader.read();
              if (done || childProcess.killed) break;
              if (value) logger.error(new TextDecoder().decode(value));
            }
          } catch (err) {
            if (!childProcess.killed)
              logger.error(`Error reading stderr: ${err}`);
          }
        };

        handleStderr();
      } else {
        // Node handling
        const textDecoder = new TextDecoder();

        const getDataHandler =
          (type: 'stderr' | 'stdout') => (data: ArrayBuffer) => {
            const textData = textDecoder.decode(data);
            if (parentPort) {
              parentPort.postMessage({ type, message: textData });
            } else {
              logger.log(textData);
            }
          };

        childProcess.stderr?.on('data', getDataHandler('stderr'));
        childProcess.stdout?.on('data', getDataHandler('stdout'));
      }

      process.on('SIGTERM', async () => {
        childProcess?.kill('SIGTERM');
        process.exit(128 + 15);
      });

      process.on('SIGINT', async () => {
        childProcess?.kill('SIGINT');
        process.exit(128 + 2);
      });

      process.on('SIGHUP', async () => {
        childProcess?.kill('SIGHUP');
        process.exit(128 + 1);
      });

      process.on('uncaughtException', async (err) => {
        console.error('Caught exception:', err);
        childProcess?.kill('SIGTERM');
        process.exit(1);
      });

      if (isBunSubprocess(childProcess)) {
        childProcess.exited.then((code) => {
          console.log(`Build completed for  ${context.projectName}`);
          next(getResult(code === 0));
          done();
        });
      } else {
        childProcess.on('exit', (code) => {
          console.log(`Build completed for  ${context.projectName}`);
          next(getResult(code === 0));
          done();
        });
      }
    });
  }
}

export default buildExecutor;
