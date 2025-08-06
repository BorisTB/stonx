#!/usr/bin/env node

const { types, scopes } = require('./commitizen.js');

console.log('🐟🐟🐟 Validating git commit message 🐟🐟🐟');

const childProcess = require('child_process');

let gitLogCmd = 'git log -1 --no-merges';

const gitRemotes = childProcess
  .execSync('git remote -v')
  .toString()
  .trim()
  .split('\n');
const upstreamRemote = gitRemotes.find((remote) =>
  remote.includes('BorisTB/stonx.git')
);
if (upstreamRemote) {
  const upstreamRemoteIdentifier = upstreamRemote.split('\t')[0].trim();
  console.log(`Comparing against remote ${upstreamRemoteIdentifier}`);
  const currentBranch = childProcess
    .execSync('git branch --show-current')
    .toString()
    .trim();

  // exclude all commits already present in upstream/main
  gitLogCmd = gitLogCmd + ` ${currentBranch} ^${upstreamRemoteIdentifier}/main`;
} else {
  console.error(
    'No upstream remote found for BorisTB/stonx.git. Skipping comparison against upstream main.'
  );
}

const gitMessage = childProcess.execSync(gitLogCmd).toString().trim();

if (!gitMessage) {
  console.log('No commits found. Skipping commit message validation.');
  process.exit(0);
}

const allowedTypes = types.map((type) => type.value).join('|');
const allowedScopes = scopes.map((scope) => scope.value).join('|');

const commitMsgRegex = `(${allowedTypes})\\((${allowedScopes})\\)!?:\\s(([a-z0-9:\\-\\s])+)`;

const matchCommit = new RegExp(commitMsgRegex, 'g').test(gitMessage);
const matchRevert = /Revert/gi.test(gitMessage);
const matchRelease = /Release/gi.test(gitMessage);
const exitCode = +!(matchRelease || matchRevert || matchCommit);

if (exitCode === 0) {
  console.log('Commit ACCEPTED 👍');
} else {
  console.log(
    '[Error]: Oh no! 😦 Your commit message: \n' +
      '-------------------------------------------------------------------\n' +
      gitMessage +
      '\n-------------------------------------------------------------------' +
      '\n\n 👉️ Does not follow the commit message convention.'
  );
  console.log('\ntype(scope): subject \n BLANK LINE \n body');
  console.log('\n');
  console.log(`possible types: ${allowedTypes}`);
  console.log(`possible scopes: ${allowedScopes} (if unsure use "core")`);
  console.log(
    '\nEXAMPLE: \n' +
      'feat(stonx): add an option to generate lazy-loadable modules\n' +
      'fix(ui)!: breaking change should have exclamation mark\n'
  );
}
process.exit(exitCode);
