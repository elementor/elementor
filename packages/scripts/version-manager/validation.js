const fs = require('fs');
const path = require('path');

function validatePackageForPublishing(pkg) {
  const errors = [];
  const warnings = [];

  let packageData;
  try {
    const content = fs.readFileSync(pkg.path, 'utf8');
    packageData = JSON.parse(content);
  } catch (error) {
    errors.push('Could not read package.json');
    return { errors, warnings };
  }

  if (!packageData.name) {
    errors.push('Missing package name');
  }

  if (!packageData.version) {
    errors.push('Missing package version');
  }

  if (!packageData.main && !packageData.module && !packageData.exports) {
    warnings.push('No entry point specified (main, module, or exports)');
  }

  if (packageData.name && packageData.name.startsWith('@')) {
    if (!packageData.publishConfig) {
      warnings.push('Scoped package should have publishConfig.access specified');
    }
  }

  if (!packageData.license) {
    warnings.push('Missing license field');
  }

  if (!packageData.repository) {
    warnings.push('Missing repository field');
  }

  const distPath = path.join(pkg.directory, 'dist');
  if (!fs.existsSync(distPath)) {
    errors.push('Missing dist directory - package must be built before publishing');
  } else {
    const distFiles = fs.readdirSync(distPath);
    if (distFiles.length === 0) {
      errors.push('Dist directory is empty - package must be built before publishing');
    }
  }

  const readmePath = path.join(pkg.directory, 'README.md');
  if (!fs.existsSync(readmePath)) {
    warnings.push('Missing README.md file');
  }

  const changelogPath = path.join(pkg.directory, 'CHANGELOG.md');
  if (!fs.existsSync(changelogPath)) {
    warnings.push('Missing CHANGELOG.md file');
  }

  return { errors, warnings };
}

function validateVersions(packages) {
  const versions = new Set(packages.map(pkg => pkg.currentVersion));
  
  if (versions.size === 1) {
    return {
      isValid: true,
      message: `All ${packages.length} packages have consistent version: ${Array.from(versions)[0]}`,
      versions: Array.from(versions)
    };
  } else {
    return {
      isValid: false,
      message: `Found ${versions.size} different versions across ${packages.length} packages`,
      versions: Array.from(versions).sort(),
      packagesWithVersions: Array.from(versions).sort().map(version => {
        const packagesWithVersion = packages.filter(pkg => pkg.currentVersion === version);
        return {
          version,
          count: packagesWithVersion.length
        };
      })
    };
  }
}

module.exports = {
  validatePackageForPublishing,
  validateVersions
}; 