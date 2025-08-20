import { rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { releasePublish, releaseVersion } from 'nx/release/index.js';

(async () => {
  console.log('=======> START');
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  console.log('=======> 2', __dirname);

  rmSync(join(__dirname, '../../dist/local-registry/storage'), {
    recursive: true,
    force: true
  });
  console.log('=======> REMOVED');

  await releaseVersion({
    specifier: '0.0.0-e2e',
    stageChanges: false,
    gitCommit: false,
    gitTag: false,
    firstRelease: true,
    versionActionsOptionsOverrides: {
      skipLockFileUpdate: true
    }
  });
  console.log('=======> VERSION');
  await releasePublish({
    tag: 'e2e',
    firstRelease: true
  });
  console.log('=======> PUBLISH');

  process.exit(0);
})();
