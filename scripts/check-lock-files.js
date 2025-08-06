const fs = require('fs');

const LOCK_FILES = {
  BUN: 'bun.lock',
  BUN_BINARY: 'bun.lockb',
  NPM: 'package-lock.json',
  PNPM: 'pnpm-lock.yaml',
  YARN: 'yarn.lock'
};

const { PNPM: VALID_LOCK_FILE, ...INVALID_LOCK_FILES } = LOCK_FILES;

function checkLockFiles() {
  const errors = [];

  if (fs.existsSync(INVALID_LOCK_FILES.NPM)) {
    errors.push(
      `Invalid occurence of "${INVALID_LOCK_FILES.NPM}" file. Please remove it and use only "${VALID_LOCK_FILE}"`
    );
  }
  if (fs.existsSync(INVALID_LOCK_FILES.BUN)) {
    errors.push(
      `Invalid occurence of "${INVALID_LOCK_FILES.BUN}" file. Please remove it and use only "${VALID_LOCK_FILE}"`
    );
  }
  if (fs.existsSync(INVALID_LOCK_FILES.BUN_BINARY)) {
    errors.push(
      `Invalid occurence of "${INVALID_LOCK_FILES.BUN_BINARY}" file. Please remove it and use only "${VALID_LOCK_FILE}"`
    );
  }
  if (fs.existsSync(INVALID_LOCK_FILES.YARN)) {
    errors.push(
      `Invalid occurence of "${INVALID_LOCK_FILES.YARN}" file. Please remove it and use only "${VALID_LOCK_FILE}"`
    );
  }
  try {
    const content = fs.readFileSync(VALID_LOCK_FILE, 'utf-8');
    if (content.match(/localhost:487/)) {
      errors.push(
        `The "${VALID_LOCK_FILE}" has reference to local repository ("localhost:4873"). Please ensure you disable local registry before running "pnpm install"`
      );
    }
    if (content.match(/resolution: \{tarball/)) {
      errors.push(
        `The "${VALID_LOCK_FILE}" has reference to tarball package. Please use npm registry only`
      );
    }
  } catch {
    errors.push(`The "${VALID_LOCK_FILE}" does not exist or cannot be read`);
  }
  return errors;
}

console.log('🔒🔒🔒 Validating lock files 🔒🔒🔒\n');
const invalid = checkLockFiles();
if (invalid.length > 0) {
  invalid.forEach((e) => console.log(e));
  process.exit(1);
} else {
  console.log('Lock file is valid 👍');
  process.exit(0);
}
