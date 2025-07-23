const { getPackages, getPublishablePackages } = require('./package-discovery');
const { validateVersions } = require('./validation');
const { logError, logSuccess, logInfo, logWarning } = require('./logger');
const { colors } = require('./constants');

/**
 * List all packages and their versions
 */
async function listPackages(options = {}) {
  const packages = await getPackages(options.packages);
  
  if (packages.length === 0) {
    logWarning('No packages found');
    return;
  }

  logInfo(`Found ${packages.length} packages:\n`);
  
  packages.forEach(pkg => {
    const relativePath = pkg.path.replace(process.cwd(), '').replace(/^\/+/, '');
    const privateStatus = pkg.private ? `${colors.red}[private]${colors.reset}` : `${colors.green}[public]${colors.reset}`;
    console.log(`${colors.cyan}${pkg.name.padEnd(30)}${colors.reset} ${colors.green}${pkg.currentVersion}${colors.reset} ${privateStatus} ${colors.yellow}(${relativePath})${colors.reset}`);
  });
}

/**
 * List only publishable packages
 */
async function listPublishablePackages(options = {}) {
  const packages = await getPublishablePackages(options.packages);
  
  if (packages.length === 0) {
    logWarning('No publishable packages found');
    return;
  }

  logInfo(`Found ${packages.length} publishable packages:\n`);
  
  packages.forEach(pkg => {
    const relativePath = pkg.path.replace(process.cwd(), '').replace(/^\/+/, '');
    console.log(`${colors.cyan}${pkg.name.padEnd(30)}${colors.reset} ${colors.green}${pkg.currentVersion}${colors.reset} ${colors.yellow}(${relativePath})${colors.reset}`);
  });
}

/**
 * Validate that all packages have consistent versioning
 */
async function validateVersionsCommand(options = {}) {
  const packages = await getPackages(options.packages);
  
  if (packages.length === 0) {
    logWarning('No packages found');
    return;
  }

  const result = validateVersions(packages);
  
  if (result.isValid) {
    logSuccess(`✅ ${result.message}`);
  } else {
    logError(`❌ ${result.message}:`);
    result.packagesWithVersions.forEach(({ version, count }) => {
      console.log(`  ${colors.yellow}${version}${colors.reset}: ${count} packages`);
    });
  }
}

module.exports = {
  listPackages,
  listPublishablePackages,
  validateVersionsCommand
}; 