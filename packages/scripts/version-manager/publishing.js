const fs = require('fs');
const { execSync } = require('child_process');
const { getPublishablePackages } = require('./package-discovery');
const { validatePackageForPublishing } = require('./validation');
const { log, logError, logSuccess, logInfo, logWarning } = require('./logger');
const { colors } = require('./constants');

/**
 * Check if package is already published at current version
 */
async function isPackagePublished(pkg) {
  try {
    const result = execSync(`npm view ${pkg.name} version`, { 
      encoding: 'utf8', 
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: pkg.directory 
    });
    const publishedVersion = result.trim();
    return publishedVersion === pkg.currentVersion;
  } catch (error) {
    // Package doesn't exist or other error - assume not published
    return false;
  }
}

/**
 * Publish packages to npm
 */
async function publishPackages(options = {}) {
  const packages = await getPublishablePackages(options.packages);
  
  if (packages.length === 0) {
    logWarning('No publishable packages found');
    return;
  }

  logInfo(`Found ${packages.length} publishable packages:\n`);

  // Validate all packages first
  const validationResults = [];
  for (const pkg of packages) {
    const validation = validatePackageForPublishing(pkg);
    validationResults.push({ pkg, validation });
    
    if (validation.errors.length > 0) {
      logError(`❌ ${pkg.name}:`);
      validation.errors.forEach(error => logError(`   ${error}`));
    } else if (validation.warnings.length > 0) {
      logWarning(`⚠️  ${pkg.name}:`);
      validation.warnings.forEach(warning => logWarning(`   ${warning}`));
    } else {
      logSuccess(`✅ ${pkg.name} (${pkg.currentVersion})`);
    }
  }

  // Check for critical errors
  const packagesWithErrors = validationResults.filter(result => result.validation.errors.length > 0);
  if (packagesWithErrors.length > 0) {
    logError(`\n❌ Cannot publish: ${packagesWithErrors.length} packages have errors`);
    process.exit(1);
  }

  // Show what will be published
  logInfo(`\n📦 Packages to publish:`);
  packages.forEach(pkg => {
    const relativePath = pkg.path.replace(process.cwd(), '').replace(/^\/+/, '');
    console.log(`  ${colors.cyan}${pkg.name.padEnd(30)}${colors.reset} ${colors.green}${pkg.currentVersion}${colors.reset} ${colors.yellow}(${relativePath})${colors.reset}`);
  });

  // Check for already published packages
  logInfo(`\n🔍 Checking if packages are already published...`);
  const alreadyPublished = [];
  for (const pkg of packages) {
    const isPublished = await isPackagePublished(pkg);
    if (isPublished) {
      alreadyPublished.push(pkg);
      logWarning(`  ${pkg.name}@${pkg.currentVersion} is already published`);
    }
  }

  if (alreadyPublished.length === packages.length) {
    logWarning('All packages are already published at their current versions');
    return;
  }

  // Confirm publishing
  if (!options.yes && !options.dryRun) {
    const unpublishedCount = packages.length - alreadyPublished.length;
    logInfo(`\n🚀 Ready to publish ${unpublishedCount} packages to npm`);
    
    // In a real implementation, you might want to prompt for confirmation here
    // For now, we'll proceed with the publishing
  }

  if (options.dryRun) {
    logWarning('\n📋 Dry run - no packages will be published');
    return;
  }

  // Publish packages
  logInfo(`\n🚀 Publishing packages to npm...`);
  const publishedPackages = [];
  const failedPackages = [];

  for (const pkg of packages) {
    const isPublished = await isPackagePublished(pkg);
    if (isPublished) {
      log(`  Skipping ${pkg.name} (already published)`, colors.yellow);
      continue;
    }

    try {
      log(`  Publishing ${pkg.name}@${pkg.currentVersion}...`, colors.blue);
      
      const publishArgs = ['publish'];
      if (options.tag) {
        publishArgs.push('--tag', options.tag);
      }
      if (options.access) {
        publishArgs.push('--access', options.access);
      }
      if (options.otp) {
        publishArgs.push('--otp', options.otp);
      }

      execSync(`npm ${publishArgs.join(' ')}`, { 
        cwd: pkg.directory,
        stdio: 'inherit'
      });

      publishedPackages.push(pkg);
      logSuccess(`  ✅ Published ${pkg.name}@${pkg.currentVersion}`);
    } catch (error) {
      failedPackages.push({ pkg, error: error.message });
      logError(`  ❌ Failed to publish ${pkg.name}: ${error.message}`);
    }
  }

  // Summary
  logInfo(`\n📊 Publishing Summary:`);
  logSuccess(`  ✅ Successfully published: ${publishedPackages.length} packages`);
  if (failedPackages.length > 0) {
    logError(`  ❌ Failed to publish: ${failedPackages.length} packages`);
    process.exit(1);
  }

  if (publishedPackages.length > 0) {
    logSuccess(`\n🎉 All packages published successfully!`);
  }
}

module.exports = {
  isPackagePublished,
  publishPackages
}; 