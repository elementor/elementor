const { Command } = require('commander');
const { logError } = require('./logger');

// Create a new Commander program instance
const program = new Command();

// Configure program metadata
program
  .name('version-manager')
  .description('Manage versions across packages in a monorepo')
  .version(require('../../../package.json').version);

// Common options for all commands
const addCommonOptions = (command) => {
  return command
    .option('--tag <suffix>', 'Add version suffix (e.g., beta, rc, alpha)')
    .option('--dry-run', 'Show what would be changed without making changes')
    .option('--packages <pattern>', 'Glob pattern for packages to update (default: all)')
    .option('--yes', 'Assume "yes" to prompts and confirmations');
};

// Set version command
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

addCommonOptions(program.commands[0]);

// Bump version command
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

addCommonOptions(program.commands[1]);

// List packages command
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

addCommonOptions(program.commands[2]);

// Validate versions command
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

addCommonOptions(program.commands[3]);

// Publish packages command
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

addCommonOptions(program.commands[4]);

// Add examples
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
`);

module.exports = program; 