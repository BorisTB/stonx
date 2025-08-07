const LOCK_FILE = 'pnpm-lock.yaml';
const INSTALL_COMMAND = 'pnpm install';

if (process.argv.slice(2).some((arg) => arg.includes(LOCK_FILE))) {
  console.warn(
    [
      '⚠️ ----------------------------------------------------------------------------------------- ⚠️',
      `⚠️ ${LOCK_FILE} changed, please run \`${INSTALL_COMMAND}\` to ensure your packages are up to date. ⚠️`,
      '⚠️ ----------------------------------------------------------------------------------------- ⚠️'
    ].join('\n')
  );
}
