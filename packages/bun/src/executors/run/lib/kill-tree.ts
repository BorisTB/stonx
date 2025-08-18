import { platform } from 'node:os';
import { ExecException } from 'node:child_process';
import {
  isBun,
  isBunSubprocess,
  runSpawn,
  UniversalChildProcess
} from '../../../utils';

async function runExec(cmd: string) {
  if (isBun) {
    const { stdout, stderr, exitCode } = await Bun.$`${cmd}`.quiet();
    return {
      stdout: stdout.toString(),
      stderr: stderr.toString(),
      exitCode: exitCode,
      success: exitCode === 0
    };
  }

  const { promisify } = await import('node:util');
  const { exec } = await import('node:child_process');
  const nodeExec = promisify(exec);

  const { stdout, stderr } = await nodeExec(cmd, { windowsHide: true });
  return {
    stdout,
    stderr,
    exitCode: 0,
    success: true
  };
}

export async function killTree(pid: number, signal: NodeJS.Signals) {
  const tree: Record<number, number[]> = {};
  const pidsToProcess: Record<number, number> = {};
  tree[pid] = [];
  pidsToProcess[pid] = 1;

  return new Promise<void>(async (resolve, reject) => {
    const callback = (error?: ExecException | null) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    };

    switch (platform()) {
      case 'win32':
        try {
          await runExec(`taskkill /pid ${pid} /T /F`);
        } catch (error: any) {
          callback(error?.code !== 128 ? error : null);
        }
        break;
      case 'darwin':
        buildProcessTree(
          pid,
          tree,
          pidsToProcess,
          function (parentPid) {
            return runSpawn('pgrep', ['-P', String(parentPid)], {
              windowsHide: false
            });
          },
          function () {
            killAll(tree, signal, callback);
          }
        );
        break;
      default: // Linux
        buildProcessTree(
          pid,
          tree,
          pidsToProcess,
          function (parentPid) {
            return runSpawn(
              'ps',
              ['-o', 'pid', '--no-headers', '--ppid', String(parentPid)],
              {
                windowsHide: false
              }
            );
          },
          function () {
            killAll(tree, signal, callback);
          }
        );
        break;
    }
  });
}

function killAll(
  tree: Record<string, number[]>,
  signal: number | string,
  callback?: (error?: any) => void
) {
  const killed: Record<string, number> = {};
  try {
    Object.keys(tree).forEach((pid) => {
      tree[pid].forEach((pidpid) => {
        if (!killed[pidpid]) {
          killPid(pidpid, signal);
          killed[pidpid] = 1;
        }
      });
      if (!killed[pid]) {
        killPid(pid, signal);
        killed[pid] = 1;
      }
    });
  } catch (err) {
    if (callback) {
      return callback(err);
    }
    throw err;
  }

  if (callback) {
    return callback();
  }
}

function killPid(pid: string | number, signal: string | number) {
  try {
    process.kill(parseInt(String(pid), 10), signal);
  } catch (err: any) {
    if (err.code !== 'ESRCH') throw err;
  }
}

function buildProcessTree(
  parentPid: number,
  tree: Record<number, number[]>,
  pidsToProcess: Record<number, number>,
  spawnChildProcessesList: (pid: number) => UniversalChildProcess,
  cb: () => void
) {
  const ps = spawnChildProcessesList(parentPid);

  let allData = '';
  if (isBunSubprocess(ps)) {
    const stdoutReader = ps.stdout?.getReader();
    const handleStdout = async () => {
      if (stdoutReader) {
        while (true) {
          const { done, value } = await stdoutReader.read();
          if (done) break;
          allData += new TextDecoder().decode(value);
        }
      }
      const code = await ps.exited;
      stdoutReader.cancel();
      onClose(code);
    };
    handleStdout();
  } else {
    ps.stdout?.on('data', (data: Buffer) => {
      allData += data.toString('ascii');
    });
    ps.on('close', onClose);
  }

  function onClose(code: number) {
    delete pidsToProcess[parentPid];

    if (code !== 0) {
      if (Object.keys(pidsToProcess).length === 0) {
        cb();
      }
      return;
    }

    allData.match(/\d+/g)?.forEach((_pid) => {
      const pid = parseInt(_pid, 10);
      tree[parentPid].push(pid);
      tree[pid] = [];
      pidsToProcess[pid] = 1;
      buildProcessTree(pid, tree, pidsToProcess, spawnChildProcessesList, cb);
    });
  }
}
