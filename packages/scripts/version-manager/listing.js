const { getPackages, getPublishablePackages } = require('./package-discovery');
const { validateVersions } = require('./validation');
const { logError, logSuccess, logInfo, logWarning } = require('./logger');
const { colors } = require('./constants');
const { incrementVersion } = require('./version-utils');

async function getPackageVersion(pattern, releaseType) {
  const packages = await getPackages();
  const regex = new RegExp(pattern);
  const matchingPackage = packages.find(p => regex.test(p.name));
  
  if (!matchingPackage) {
    return '';
  }

  const version = matchingPackage.currentVersion;
  return releaseType ? incrementVersion(version, releaseType) : version;
}

async function listPackages(options = {}) {
  const packages = await getPackages(options.packages);
  
  if (packages.length === 0) {
    logWarning('No packages found');
    return;
  }

  logInfo(`Found ${packages.length} packages:`);
  
  packages.forEach(pkg => {
    const relativePath = pkg.path.replace(process.cwd(), '').replace(/^\/+/, '');
    const privateStatus = pkg.private ? `${colors.red}[private]${colors.reset}` : `${colors.green}[public]${colors.reset}`;
    logInfo(`${colors.cyan}${pkg.name.padEnd(30)}${colors.reset} ${colors.green}${pkg.currentVersion}${colors.reset} ${privateStatus} ${colors.yellow}(${relativePath})${colors.reset}`);
  });
}

async function listPublishablePackages(options = {}) {
  const packages = await getPublishablePackages(options.packages);
  
  if (packages.length === 0) {
    logWarning('No publishable packages found');
    return;
  }

  logInfo(`Found ${packages.length} publishable packages:`);
  
  packages.forEach(pkg => {
    const relativePath = pkg.path.replace(process.cwd(), '').replace(/^\/+/, '');
    logInfo(`${colors.cyan}${pkg.name.padEnd(30)}${colors.reset} ${colors.green}${pkg.currentVersion}${colors.reset} ${colors.yellow}(${relativePath})${colors.reset}`);
  });
}

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
      logInfo(`  ${colors.yellow}${version}${colors.reset}: ${count} packages`);
    });
  }
}

module.exports = {
  listPackages,
  listPublishablePackages,
  validateVersionsCommand,
  getPackageVersion
}; 