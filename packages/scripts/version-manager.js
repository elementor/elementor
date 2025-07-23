#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { execSync } = require('child_process');

// ANSI color codes for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
  reset: '\x1b[0m'
};

function log(message, color = '') {
  console.log(`${color}${message}${colors.reset}`);
}

function logError(message) {
  console.error(`${colors.red}Error:${colors.reset} ${message}`);
}

function logSuccess(message) {
  log(message, colors.green);
}

function logInfo(message) {
  log(message, colors.blue);
}

function logWarning(message) {
  log(message, colors.yellow);
}

class VersionManager {
  constructor() {
    this.workspacePatterns = ['core/*', 'libs/*', 'tools/*'];
  }

  /**
   * Get all packages matching the pattern
   */
  async getPackages(pattern) {
    // If we're in the packages directory, adjust the pattern
    const isInPackagesDir = process.cwd().endsWith('packages');
    const basePattern = isInPackagesDir ? 'packages/{core,libs,tools}/*/package.json' : `packages/packages/{${this.workspacePatterns.join(',')}}/package.json`;
    const searchPattern = pattern || basePattern;
    
    // Ensure the pattern ends with /package.json if it doesn't already
    const finalPattern = searchPattern.endsWith('/package.json') ? searchPattern : `${searchPattern}/package.json`;
    
    const packageFiles = glob.sync(finalPattern, { cwd: process.cwd() });
    
    const files = packageFiles;
    
    const packages = [];

    for (const packageFile of files) {
      const fullPath = path.join(process.cwd(), packageFile);
      
      if (!fs.existsSync(fullPath)) {
        continue;
      }

      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const pkg = JSON.parse(content);
        
        if (pkg.name && pkg.version) {
          packages.push({
            path: fullPath,
            name: pkg.name,
            currentVersion: pkg.version,
            private: pkg.private || false,
            publishConfig: pkg.publishConfig || {},
            directory: path.dirname(fullPath)
          });
        }
      } catch (error) {
        logWarning(`Warning: Could not parse ${packageFile}`);
      }
    }

    return packages.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Get only publishable packages (private: false)
   */
  async getPublishablePackages(pattern) {
    const allPackages = await this.getPackages(pattern);
    return allPackages.filter(pkg => !pkg.private);
  }

  /**
   * Validate package for publishing
   */
  validatePackageForPublishing(pkg) {
    const errors = [];
    const warnings = [];

    // Read the actual package.json to get the full package data
    let packageData;
    try {
      const content = fs.readFileSync(pkg.path, 'utf8');
      packageData = JSON.parse(content);
    } catch (error) {
      errors.push('Could not read package.json');
      return { errors, warnings };
    }

    // Check if package has required fields
    if (!packageData.name) {
      errors.push('Missing package name');
    }

    if (!packageData.version) {
      errors.push('Missing package version');
    }

    if (!packageData.main && !packageData.module && !packageData.exports) {
      warnings.push('No entry point specified (main, module, or exports)');
    }

    // Check for required fields for scoped packages
    if (packageData.name && packageData.name.startsWith('@')) {
      if (!packageData.publishConfig) {
        warnings.push('Scoped package should have publishConfig.access specified');
      }
    }

    // Check for license
    if (!packageData.license) {
      warnings.push('Missing license field');
    }

    // Check for repository
    if (!packageData.repository) {
      warnings.push('Missing repository field');
    }

    // Check if dist directory exists
    const distPath = path.join(pkg.directory, 'dist');
    if (!fs.existsSync(distPath)) {
      errors.push('Missing dist directory - package must be built before publishing');
    } else {
      // Check if dist directory has content
      const distFiles = fs.readdirSync(distPath);
      if (distFiles.length === 0) {
        errors.push('Dist directory is empty - package must be built before publishing');
      }
    }

    // Check for README
    const readmePath = path.join(pkg.directory, 'README.md');
    if (!fs.existsSync(readmePath)) {
      warnings.push('Missing README.md file');
    }

    // Check for CHANGELOG
    const changelogPath = path.join(pkg.directory, 'CHANGELOG.md');
    if (!fs.existsSync(changelogPath)) {
      warnings.push('Missing CHANGELOG.md file');
    }

    return { errors, warnings };
  }

  /**
   * Check if package is already published at current version
   */
  async isPackagePublished(pkg) {
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
  async publishPackages(options = {}) {
    const packages = await this.getPublishablePackages(options.packages);
    
    if (packages.length === 0) {
      logWarning('No publishable packages found');
      return;
    }

    logInfo(`Found ${packages.length} publishable packages:\n`);

    // Validate all packages first
    const validationResults = [];
    for (const pkg of packages) {
      const validation = this.validatePackageForPublishing(pkg);
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
      const isPublished = await this.isPackagePublished(pkg);
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
      const isPublished = await this.isPackagePublished(pkg);
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

  /**
   * Apply tag suffix to version
   */
  applyTag(version, tag) {
    if (!tag) {
      return version;
    }

    // Remove any existing pre-release tags
    const cleanVersion = this.cleanVersion(version);
    
    // Add the new tag
    return `${cleanVersion}-${tag}`;
  }

  /**
   * Clean version string
   */
  cleanVersion(version) {
    // Simple version cleaning - remove pre-release tags
    return version.split('-')[0];
  }

  /**
   * Get the highest version from a list of packages
   */
  getHighestVersion(packages) {
    const versions = packages.map(pkg => pkg.currentVersion);
    const validVersions = versions.filter(version => this.isValidVersion(version));
    
    if (validVersions.length === 0) {
      throw new Error('No valid semver versions found in packages');
    }

    return validVersions.reduce((highest, current) => {
      return this.compareVersions(current, highest) > 0 ? current : highest;
    });
  }

  /**
   * Simple version comparison
   */
  compareVersions(v1, v2) {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const part1 = parts1[i] || 0;
      const part2 = parts2[i] || 0;
      
      if (part1 > part2) return 1;
      if (part1 < part2) return -1;
    }
    
    return 0;
  }

  /**
   * Simple version validation
   */
  isValidVersion(version) {
    return /^\d+\.\d+\.\d+/.test(version);
  }

  /**
   * Increment version
   */
  incrementVersion(version, type) {
    const parts = version.split('.').map(Number);
    
    switch (type) {
      case 'patch':
        parts[2] = (parts[2] || 0) + 1;
        break;
      case 'minor':
        parts[1] = (parts[1] || 0) + 1;
        parts[2] = 0;
        break;
      case 'major':
        parts[0] = (parts[0] || 0) + 1;
        parts[1] = 0;
        parts[2] = 0;
        break;
      default:
        throw new Error(`Invalid bump type: ${type}`);
    }
    
    return parts.join('.');
  }

  /**
   * Set exact version for all packages
   */
  async setVersion(version, options = {}) {
    const packages = await this.getPackages(options.packages);
    const finalVersion = this.applyTag(version, options.tag);

    logInfo(`Setting version to ${colors.bold}${finalVersion}${colors.reset} for ${packages.length} packages`);

    if (options.dryRun) {
      this.showChanges(packages, finalVersion);
      return;
    }

    await this.updatePackages(packages, finalVersion);
    logSuccess(`✅ Successfully updated ${packages.length} packages to version ${finalVersion}`);
  }

  /**
   * Bump version using semver
   */
  async bumpVersion(type, options = {}) {
    if (!['patch', 'minor', 'major'].includes(type)) {
      throw new Error(`Invalid bump type: ${type}. Must be one of: patch, minor, major`);
    }

    const packages = await this.getPackages(options.packages);
    
    if (packages.length === 0) {
      throw new Error('No packages found to update');
    }

    // Use base version or get the highest version from packages
    const baseVersion = options.baseVersion || this.getHighestVersion(packages);
    const bumpedVersion = this.incrementVersion(baseVersion, type);
    const finalVersion = this.applyTag(bumpedVersion, options.tag);

    logInfo(`Bumping version from ${colors.bold}${baseVersion}${colors.reset} to ${colors.bold}${finalVersion}${colors.reset} (${type})`);

    if (options.dryRun) {
      this.showChanges(packages, finalVersion);
      return;
    }

    await this.updatePackages(packages, finalVersion);
    logSuccess(`✅ Successfully bumped ${packages.length} packages to version ${finalVersion}`);
  }

  /**
   * List all packages and their versions
   */
  async listPackages(options = {}) {
    const packages = await this.getPackages(options.packages);
    
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
  async listPublishablePackages(options = {}) {
    const packages = await this.getPublishablePackages(options.packages);
    
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
  async validateVersions(options = {}) {
    const packages = await this.getPackages(options.packages);
    
    if (packages.length === 0) {
      logWarning('No packages found');
      return;
    }

    const versions = new Set(packages.map(pkg => pkg.currentVersion));
    
    if (versions.size === 1) {
      logSuccess(`✅ All ${packages.length} packages have consistent version: ${Array.from(versions)[0]}`);
    } else {
      logError(`❌ Found ${versions.size} different versions across ${packages.length} packages:`);
      Array.from(versions).sort().forEach(version => {
        const packagesWithVersion = packages.filter(pkg => pkg.currentVersion === version);
        console.log(`  ${colors.yellow}${version}${colors.reset}: ${packagesWithVersion.length} packages`);
      });
    }
  }

  /**
   * Show what changes would be made (dry run)
   */
  showChanges(packages, newVersion) {
    logWarning('\n📋 Dry run - no changes will be made:\n');
    
    packages.forEach(pkg => {
      const relativePath = pkg.path.replace(process.cwd(), '').replace(/^\/+/, '');
      console.log(`${colors.cyan}${pkg.name.padEnd(30)}${colors.reset} ${colors.red}${pkg.currentVersion}${colors.reset} → ${colors.green}${newVersion}${colors.reset} ${colors.yellow}(${relativePath})${colors.reset}`);
    });
    
    logWarning(`\nWould update ${packages.length} packages to version ${newVersion}`);
  }

  /**
   * Update all packages to the new version
   */
  async updatePackages(packages, newVersion) {
    for (const pkg of packages) {
      try {
        const content = fs.readFileSync(pkg.path, 'utf8');
        const pkgData = JSON.parse(content);
        
        pkgData.version = newVersion;
        
        // Update dependencies that reference other workspace packages
        await this.updateDependencies(pkgData, newVersion);
        
        const updatedContent = JSON.stringify(pkgData, null, 2) + '\n';
        fs.writeFileSync(pkg.path, updatedContent, 'utf8');
        
        log(`  Updated ${pkg.name} to ${newVersion}`, colors.yellow);
      } catch (error) {
        logError(`  Failed to update ${pkg.name}: ${error.message}`);
      }
    }
  }

  /**
   * Update dependencies that reference other workspace packages
   */
  async updateDependencies(pkgData, newVersion) {
    const dependencyTypes = ['dependencies', 'devDependencies', 'peerDependencies'];
    const workspacePackages = await this.getPackages();
    const workspaceNames = new Set(workspacePackages.map(pkg => pkg.name));

    for (const depType of dependencyTypes) {
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
}

// CLI interface
function showHelp() {
  console.log(`
Usage: node scripts/version-manager.js <command> [options]

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
  node scripts/version-manager.js set 3.31.0
  node scripts/version-manager.js set 3.31.0 --tag beta.1
  node scripts/version-manager.js set 3.31.0 --dry-run
  node scripts/version-manager.js set 3.31.0 --packages "packages/core/*"
  node scripts/version-manager.js bump patch
  node scripts/version-manager.js bump minor --tag rc.1
  node scripts/version-manager.js list
  node scripts/version-manager.js list --publishable
  node scripts/version-manager.js validate
  node scripts/version-manager.js publish --yes
  node scripts/version-manager.js publish --dry-run
  node scripts/version-manager.js publish --packages "packages/libs/*"
`);
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }

  const command = args[0];
  const manager = new VersionManager();

  try {
    switch (command) {
      case 'set':
        if (args.length < 2) {
          throw new Error('Version is required for set command');
        }
        const version = args[1];
        const setOptions = parseOptions(args.slice(2));
        await manager.setVersion(version, setOptions);
        break;

      case 'bump':
        if (args.length < 2) {
          throw new Error('Bump type is required for bump command');
        }
        const type = args[1];
        const bumpOptions = parseOptions(args.slice(2));
        await manager.bumpVersion(type, bumpOptions);
        break;

      case 'list':
        const listOptions = parseOptions(args.slice(1));
        if (listOptions.publishable) {
          await manager.listPublishablePackages(listOptions);
        } else {
          await manager.listPackages(listOptions);
        }
        break;

      case 'validate':
        const validateOptions = parseOptions(args.slice(1));
        await manager.validateVersions(validateOptions);
        break;

      case 'publish':
        const publishOptions = parseOptions(args.slice(1));
        await manager.publishPackages(publishOptions);
        break;

      default:
        throw new Error(`Unknown command: ${command}`);
    }
  } catch (error) {
    logError(error.message);
    process.exit(1);
  }
}

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

// Run the script
if (require.main === module) {
  main();
}

module.exports = VersionManager; 