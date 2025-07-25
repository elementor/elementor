const fs = require('fs');
const { getPackages } = require('./package-discovery');
const { applyTag, getHighestVersion, incrementVersion } = require('./version-utils');
const { log, logError, logSuccess, logInfo, logWarning } = require('./logger');
const { colors, DEPENDENCY_TYPES } = require('./constants');

/**
 * Show what changes would be made (dry run)
 */
function showChanges(packages, newVersion) {
  logWarning('\n📋 Dry run - no changes will be made:\n');
  
  packages.forEach(pkg => {
    const relativePath = pkg.path.replace(process.cwd(), '').replace(/^\/+/, '');
    console.log(`${colors.cyan}${pkg.name.padEnd(30)}${colors.reset} ${colors.red}${pkg.currentVersion}${colors.reset} → ${colors.green}${newVersion}${colors.reset} ${colors.yellow}(${relativePath})${colors.reset}`);
  });
  
  logWarning(`\nWould update ${packages.length} packages to version ${newVersion}`);
}

/**
 * Update dependencies that reference other workspace packages
 */
async function updateDependencies(pkgData, newVersion) {
  const workspacePackages = await getPackages();
  const workspaceNames = new Set(workspacePackages.map(pkg => pkg.name));

  for (const depType of DEPENDENCY_TYPES) {
    if (pkgData[depType]) {
      for (const [depName, depVersion] of Object.entries(pkgData[depType])) {
        if (workspaceNames.has(depName) && typeof depVersion === 'string') {
          // Update workspace dependency to match the new version
          pkgData[depType][depName] = newVersion;
        }
      }
    }
  }
}

/**
 * Update all packages to the new version
 */
async function updatePackages(packages, newVersion) {
  for (const pkg of packages) {
    try {
      const content = fs.readFileSync(pkg.path, 'utf8');
      const pkgData = JSON.parse(content);
      
      pkgData.version = newVersion;
      
      // Update dependencies that reference other workspace packages
      await updateDependencies(pkgData, newVersion);
      
      const updatedContent = JSON.stringify(pkgData, null, 2) + '\n';
      fs.writeFileSync(pkg.path, updatedContent, 'utf8');
      
      log(`  Updated ${pkg.name} to ${newVersion}`, colors.yellow);
    } catch (error) {
      logError(`  Failed to update ${pkg.name}: ${error.message}`);
    }
  }
}

/**
 * Set exact version for all packages
 */
async function setVersion(version, options = {}) {
  const packages = await getPackages(options.packages);
  const finalVersion = applyTag(version, options.tag);

  logInfo(`Setting version to ${colors.bold}${finalVersion}${colors.reset} for ${packages.length} packages`);

  if (options.dryRun) {
    showChanges(packages, finalVersion);
    return;
  }

  await updatePackages(packages, finalVersion);
  logSuccess(`✅ Successfully updated ${packages.length} packages to version ${finalVersion}`);
}

/**
 * Bump version using semver
 */
async function bumpVersion(type, options = {}) {
  const packages = await getPackages(options.packages);
  
  if (packages.length === 0) {
    throw new Error('No packages found to update');
  }

  // Use base version or get the highest version from packages
  const baseVersion = options.baseVersion || getHighestVersion(packages);
  const bumpedVersion = incrementVersion(baseVersion, type);
  const finalVersion = applyTag(bumpedVersion, options.tag);

  logInfo(`Bumping version from ${colors.bold}${baseVersion}${colors.reset} to ${colors.bold}${finalVersion}${colors.reset} (${type})`);

  if (options.dryRun) {
    showChanges(packages, finalVersion);
    return;
  }

  await updatePackages(packages, finalVersion);
  logSuccess(`✅ Successfully bumped ${packages.length} packages to version ${finalVersion}`);
}

module.exports = {
  setVersion,
  bumpVersion,
  showChanges,
  updatePackages,
  updateDependencies
}; 