import { ExecutorContext } from '@nx/devkit';

import { RunExecutorOptions } from './schema';
import executor from './run';

const options: RunExecutorOptions = {};
const context: ExecutorContext = {
  root: '',
  cwd: process.cwd(),
  isVerbose: false,
  projectGraph: {
    nodes: {},
    dependencies: {}
  },
  projectsConfigurations: {
    projects: {},
    version: 2
  },
  nxJsonConfiguration: {}
};

describe('Run Executor', () => {
  it('can run', async () => {
    const output = await executor(options, context);
    expect(output.success).toBe(true);
  });
});
