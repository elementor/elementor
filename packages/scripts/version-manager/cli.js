const { logError } = require('./logger');

/**
 * Show help information
 */
function showHelp() {
  console.log(`
Usage: node scripts/version-manager/index.js <command> [options]

Commands:
  set <version>              Set exact version for all packages
  bump <type>                Bump version using semver (patch, minor, major)
  list                       List all packages and their current versions
  validate                   Validate that all packages have consistent versioning
  publish                    Publish packages to npm (only non-private packages)

Options:
  --tag <suffix>             Add version suffix (e.g., beta, rc, alpha)
  --dry-run                  Show what would be changed without making changes
  --packages <pattern>       Glob pattern for packages to update (default: all)
  --base-version <version>   Base version to bump from (for bump command)
  --yes                      Assume "yes" to prompts and confirmations
  --access <public|restricted> Access level for published packages
  --otp <token>              Two-factor authentication token for npm
  --publishable              List only publishable packages (for list command)

Examples:
  node scripts/version-manager/index.js set 3.31.0
  node scripts/version-manager/index.js set 3.31.0 --tag beta.1
  node scripts/version-manager/index.js set 3.31.0 --dry-run
  node scripts/version-manager/index.js set 3.31.0 --packages "packages/core/*"
  node scripts/version-manager/index.js bump patch
  node scripts/version-manager/index.js bump minor --tag rc.1
  node scripts/version-manager/index.js list
  node scripts/version-manager/index.js list --publishable
  node scripts/version-manager/index.js validate
  node scripts/version-manager/index.js publish --yes
  node scripts/version-manager/index.js publish --dry-run
  node scripts/version-manager/index.js publish --packages "packages/libs/*"
`);
}

/**
 * Parse command line options
 */
function parseOptions(args) {
  const options = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--tag':
        options.tag = args[++i];
        break;
      case '--dry-run':
      case '--dryrun':
        options.dryRun = true;
        break;
      case '--packages':
        options.packages = args[++i];
        break;
      case '--base-version':
        options.baseVersion = args[++i];
        break;
      case '--yes':
        options.yes = true;
        break;
      case '--access':
        options.access = args[++i];
        break;
      case '--otp':
        options.otp = args[++i];
        break;
      case '--publishable':
        options.publishable = true;
        break;
      default:
        if (arg.startsWith('--')) {
          // Skip unknown options instead of throwing error
          // This allows npm to pass its own flags
          continue;
        }
    }
  }
  
  return options;
}

/**
 * Handle CLI commands
 */
async function handleCommands(args) {
  const command = args[0];
  
  // Import modules dynamically to avoid circular dependencies
  const { setVersion, bumpVersion } = require('./version-operations');
  const { listPackages, listPublishablePackages, validateVersionsCommand } = require('./listing');
  const { publishPackages } = require('./publishing');

  try {
    switch (command) {
      case 'set':
        if (args.length < 2) {
          throw new Error('Version is required for set command');
        }
        const version = args[1];
        const setOptions = parseOptions(args.slice(2));
        await setVersion(version, setOptions);
        break;

      case 'bump':
        if (args.length < 2) {
          throw new Error('Bump type is required for bump command');
        }
        const type = args[1];
        const bumpOptions = parseOptions(args.slice(2));
        await bumpVersion(type, bumpOptions);
        break;

      case 'list':
        const listOptions = parseOptions(args.slice(1));
        if (listOptions.publishable) {
          await listPublishablePackages(listOptions);
        } else {
          await listPackages(listOptions);
        }
        break;

      case 'validate':
        const validateOptions = parseOptions(args.slice(1));
        await validateVersionsCommand(validateOptions);
        break;

      case 'publish':
        const publishOptions = parseOptions(args.slice(1));
        await publishPackages(publishOptions);
        break;

      default:
        throw new Error(`Unknown command: ${command}`);
    }
  } catch (error) {
    logError(error.message);
    process.exit(1);
  }
}

module.exports = {
  showHelp,
  parseOptions,
  handleCommands
}; 