const { Command } = require('commander');
const { logError } = require('./logger');

const program = new Command();

program
  .name('version-manager')
  .description('Manage versions across packages in a monorepo')
  .version(require('../../../package.json').version);

const addCommonOptions = (command) => {
  return command
    .option('--tag <suffix>', 'Add version suffix (e.g., beta, rc, alpha)')
    .option('--dry-run', 'Show what would be changed without making changes')
    .option('--packages <pattern>', 'Glob pattern for packages to update (default: all)')
    .option('--yes', 'Assume "yes" to prompts and confirmations');
};

program
  .command('set')
  .description('Set exact version for all packages')
  .argument('<version>', 'Version to set')
  .hook('preAction', async () => {
    const { setVersion } = await import('./version-operations.js');
    program.setVersion = setVersion;
  })
  .action(async (version, options) => {
    try {
      await program.setVersion(version, options);
    } catch (error) {
      logError(error.message);
      process.exit(1);
    }
  });

program
  .command('bump')
  .description('Bump version using semver')
  .argument('<type>', 'Version bump type (patch, minor, major)')
  .option('--base-version <version>', 'Base version to bump from')
  .hook('preAction', async () => {
    const { bumpVersion } = await import('./version-operations.js');
    program.bumpVersion = bumpVersion;
  })
  .action(async (type, options) => {
    try {
      await program.bumpVersion(type, options);
    } catch (error) {
      logError(error.message);
      process.exit(1);
    }
  });

program
  .command('list')
  .description('List all packages and their current versions')
  .option('--publishable', 'List only publishable packages')
  .hook('preAction', async () => {
    const { listPackages, listPublishablePackages } = await import('./listing.js');
    program.listPackages = listPackages;
    program.listPublishablePackages = listPublishablePackages;
  })
  .action(async (options) => {
    try {
      if (options.publishable) {
        await program.listPublishablePackages(options);
      } else {
        await program.listPackages(options);
      }
    } catch (error) {
      logError(error.message);
      process.exit(1);
    }
  });

program
  .command('validate')
  .description('Validate that all packages have consistent versioning')
  .hook('preAction', async () => {
    const { validateVersionsCommand } = await import('./listing.js');
    program.validateVersionsCommand = validateVersionsCommand;
  })
  .action(async (options) => {
    try {
      await program.validateVersionsCommand(options);
    } catch (error) {
      logError(error.message);
      process.exit(1);
    }
  });

program
  .command('publish')
  .description('Publish packages to npm (only non-private packages)')
  .option('--access <public|restricted>', 'Access level for published packages')
  .option('--otp <token>', 'Two-factor authentication token for npm')
  .hook('preAction', async () => {
    const { publishPackages } = await import('./publishing.js');
    program.publishPackages = publishPackages;
  })
  .action(async (options) => {
    try {
      await program.publishPackages(options);
    } catch (error) {
      logError(error.message);
      process.exit(1);
    }
  });

program
  .command('get-version')
  .description('Get version of packages matching the regex pattern with clean output')
  .argument('<pattern>', 'Regex pattern to match package names')
  .option('--release-type <type>', 'Calculate new version by release type (patch, minor, major)')
  .hook('preAction', async () => {
    const { getPackageVersion } = await import('./listing.js');
    program.getPackageVersion = getPackageVersion;
  })
  .action(async (pattern, options) => {
    try {
      const version = await program.getPackageVersion(pattern, options.releaseType);
      if (version) {
        process.stdout.write(version);
      } else {
        process.exit(1);
      }
    } catch (error) {
      logError(error.message);
      process.exit(1);
    }
  });

program.addHelpText('after', `
Examples:
  $ version-manager set 3.31.0
  $ version-manager set 3.31.0 --tag beta.1
  $ version-manager set 3.31.0 --dry-run
  $ version-manager set 3.31.0 --packages "packages/core/*"
  $ version-manager bump patch
  $ version-manager bump minor --tag rc.1
  $ version-manager list
  $ version-manager list --publishable
  $ version-manager validate
  $ version-manager publish --yes
  $ version-manager publish --dry-run
  $ version-manager publish --packages "packages/libs/*"
  $ version-manager get-version "@elementor/editor-controls"
  $ version-manager get-version "editor-.*"
  $ version-manager get-version "@elementor/.*"
  $ version-manager get-version "@elementor/editor-controls" --release-type patch
  $ version-manager get-version "editor-.*" --release-type minor
`);

program.commands.forEach((command) => {
  addCommonOptions(command);
});

module.exports = program;