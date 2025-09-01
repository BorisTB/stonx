import { spawn } from './spawn';
import type { ChildProcess } from 'node:child_process';
import {
  mockIsBunRuntime,
  mockBunSpawn,
  restoreBunSpawn,
  mockNodeSpawn
} from './__tests__/helpers';

// module path that exports isBunRuntime used by spawn.ts
const utilsModulePath = '../utils';

describe('universal spawn', () => {
  afterEach(() => {
    // restoreIsBunRuntime(utilsModulePath);
    // restoreBunSpawn();
    // restoreNodeSpawn();
  });

  it('uses Bun.spawn if available', async () => {
    (globalThis as any).Bun = {
      spawn: jest.fn().mockReturnValue('bun-result')
    };

    const result = spawn('echo', ['testing']);
    expect((globalThis as any).Bun.spawn).toHaveBeenCalledWith({
      cmd: ['echo', 'testing']
    });
    expect(result).toEqual('bun-result');
  });

  it.skip('routes to Bun.spawn with proper mapping when isBunRuntime()', (done) => {
    // mockIsBunRuntime(utilsModulePath, true);

    // let received: any;
    // const fakeSubprocess = {
    //   stdout: {
    //     async text() {
    //       return 'ok-bun';
    //     }
    //   }
    // } as unknown as Bun.Subprocess;
    //
    // mockBunSpawn((opts: any) => {
    //   received = opts;
    //   return fakeSubprocess;
    // });

    // const proc = spawn('bun', ['--version']);

    const proc = spawn('echo', ['testing'], {
      stdin: 'pipe',
      stdout: 'pipe',
      stderr: 'pipe',
      stdio: 'pipe'
    });

    // @ts-ignore
    // const out = await proc.stdout.text();

    proc.stdout.on('data', function (data: string) {
      expect(data.toString()).toEqual('testing');
      done();
    });
    // expect(out).toBe('ok-bun');

    // expect(received).toBeTruthy();
    // expect(received.cmd).toEqual(['echo', 'hello']);
    // expect(received.cwd).toBe('/tmp/test');
    // expect(received.env.TEST_VAR).toBe('1');
    // expect(received.stdio).toEqual(['pipe', 'pipe', 'pipe']);
  });

  it.skip('routes to node:child_process.spawn when not Bun runtime', () => {
    mockIsBunRuntime(utilsModulePath, false);

    const calls: any[] = [];
    mockNodeSpawn(((command: string, args: string[], options: any) => {
      calls.push({ command, args, options });
      // Return a minimal ChildProcess-like object
      return { pid: 1234 } as unknown as ChildProcess;
    }) as any);

    const proc = spawn('node', ['-v'], {
      cwd: '/work',
      env: { ABC: 'xyz' },
      stdio: 'inherit'
    });

    expect(proc).toBeTruthy();
    expect(calls).toHaveLength(1);
    expect(calls[0].command).toBe('node');
    expect(calls[0].args).toEqual(['-v']);
    expect(calls[0].options.cwd).toBe('/work');
    expect(calls[0].options.env.ABC).toBe('xyz');
    expect(calls[0].options.stdio).toBe('inherit');
  });

  it.skip('applies default stdio mapping: stdin/stdout/stderr inherit for Bun; stdio inherit for Node', () => {
    // Bun branch
    mockIsBunRuntime(utilsModulePath, true);
    let bunOpts: any;
    mockBunSpawn((opts: any) => {
      bunOpts = opts;
      return {} as any;
    });
    spawn('cmd');
    expect(bunOpts.stdio).toEqual(['inherit', 'inherit', 'inherit']);

    // Node branch
    restoreBunSpawn();
    mockIsBunRuntime(utilsModulePath, false);
    const calls: any[] = [];
    mockNodeSpawn(((c: string, a: string[], o: any) => {
      calls.push(o);
      return {} as any;
    }) as any);
    spawn('cmd');
    expect(calls[0].stdio).toEqual('inherit');
  });
});
