import { execSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import semver from 'semver';

// X.Y.Z or X.Y.Z-betaN — no dot between "beta" and the number
const ALLOWED_PATTERN = /^\d+\.\d+\.\d+(-beta\d+)?$/;

// ─── I/O helpers ──────────────────────────────────────────────────────────────

function getVersion() {
  const version = (process.env.INPUT_VERSION ?? '').trim();

  if ( ! version ) {
    throw new Error('No version provided. Set the INPUT_VERSION environment variable.');
  }

  return version;
}

function setOutput(name, value) {
  // GITHUB_OUTPUT is always set in Actions; fall back to stdout for local testing.
  const outputFile = process.env.GITHUB_OUTPUT;

  if (outputFile) {
    appendFileSync(outputFile, `${name}=${value}\n`);
  } else {
    console.log(`OUTPUT ${name}=${value}`);
  }
}

// ─── validation ───────────────────────────────────────────────────────────────

function validateFormat( version ) {
  if ( ! semver.valid( version ) || ! ALLOWED_PATTERN.test( version ) ) {
    throw new Error(
      `Version "${version}" is not in the correct format.\n` +
      'Expected: X.Y.Z or X.Y.Z-betaN  (e.g. 4.1.0, 5.20.15, 4.1.0-beta1, 5.20.0-beta3)'
    );
  }

  console.log(`✅ Version format is valid: ${version}`);
}

function checkTagDoesNotExist(version) {
  let existingTags;

  try {
    existingTags = execSync('git tag -l', { encoding: 'utf8' });
  } catch ( err ) {
    throw new Error( `Failed to list git tags: ${err.message}` );
  }

  const tagName = `v${version}`;

  if (existingTags.split('\n').some((t) => t.trim() === tagName)) {
    throw new Error(`Version ${version} already exists as a GitHub Release (tag ${tagName} found).`);
  }

  console.log(`✅ Version ${version} does not exist as a GitHub Release.`);
}

// ─── derivation ───────────────────────────────────────────────────────────────

function extractChannel(version) {
  const prerelease = semver.prerelease(version); // null or e.g. ['beta1']

  console.log({prerelease, version})

  if (prerelease === null) {
    return 'stable';
  }

  // prerelease[0] is 'beta1' for '4.1.0-beta1' (no dot → single identifier)
  if (typeof prerelease[0] === 'string' && prerelease[0].startsWith('beta')) {
    return 'beta';
  }

  throw new Error(
    `Could not determine channel from version "${version}".\n` +
    'Pre-release identifier must be "beta" (e.g. 4.1.0-beta1).'
  );
}

function deriveBranch(version) {
  const { major, minor } = semver.parse(version);
  const paddedMinor = String(minor).padStart(2, '0');
  return `${major}.${paddedMinor}`;
}

// ─── entry point ──────────────────────────────────────────────────────────────

function main() {
  try {
    const version = getVersion();

    validateFormat(version);
    checkTagDoesNotExist(version);

    const channel = extractChannel(version);
    console.log(`✅ Channel resolved to: ${channel}`);

    const branch = deriveBranch(version, channel);
    console.log(`✅ Checkout branch: ${branch}`);

    setOutput('channel', channel);
    setOutput('checkout_branch', branch);
  } catch (err) {
    console.error(`\n::error::${err.message}\n`);
    process.exit(1);
  }
}

main();
