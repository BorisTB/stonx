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
import { getBunBuildConfig } from './lib/get-bun-build-config';
import { getBunBuildArgv } from './lib/get-bun-build-argv';

async function* buildExecutor(
  options: BuildExecutorOptions,
  context: ExecutorContext
) {
  const bunVersion = await getBunVersion();

  if (!bunVersion) {
    throw new Error(`bun command not found. Make sure the bun is available`);
  }

  if (!context.projectName) {
    throw new Error(`project name is undefined`);
  }

  process.env['NODE_ENV'] ??= 'production';

  if (isBun) {
    const config = getBunBuildConfig(options, context);
    const result = await Bun.build(config);
    for (const log of result.logs) {
      console.log(log);
    }
    if (result.success) {
      const outputTextAsync = result.outputs.flatMap((res) => res.text());
      const outputText = await Promise.all(outputTextAsync);
      outputText.forEach((out) => console.log(out));
      console.log(`Build completed for  ${context.projectName}`);
      yield { success: true };
    } else {
      yield { success: false };
    }
  } else {
    const args = getBunBuildArgv(options, context);
    yield* createAsyncIterable<{
      success: boolean;
      options?: Record<string, any>;
    }>(async ({ next, done }) => {
      const childProcess = spawnWithBun(args, {
        stderr: 'inherit',
        stdin: 'pipe',
        stdout: 'inherit'
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
          next({ success: code === 0 });
          done();
        });
      } else {
        childProcess.on('exit', (code) => {
          console.log(`Build completed for  ${context.projectName}`);
          next({ success: code === 0 });
          done();
        });
      }
    });
  }
}

export default buildExecutor;
