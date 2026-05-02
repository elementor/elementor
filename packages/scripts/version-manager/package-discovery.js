const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { logWarning } = require('./logger');

const GLOB_IGNORE = ['**/node_modules/**'];

function getSearchRoot() {
  const cwd = process.cwd();
  const isInPackagesDir = cwd.endsWith('packages');
  return isInPackagesDir ? cwd : path.join(cwd, 'packages');
}

function getRootPackagePath() {
  const root = getSearchRoot();
  return path.relative(process.cwd(), path.join(root, 'package.json'));
}

function discoverPackagePaths(pattern) {
  if (pattern) {
    const finalPattern = pattern.endsWith('/package.json') ? pattern : `${pattern}/package.json`;
    return glob.sync(finalPattern, { cwd: process.cwd(), ignore: GLOB_IGNORE });
  }
  const root = getSearchRoot();
  const globPattern = root === process.cwd() ? '**/package.json' : 'packages/**/package.json';
  const rootPackagePath = getRootPackagePath();
  const files = glob.sync(globPattern, { cwd: process.cwd(), ignore: GLOB_IGNORE });
  return files.filter((file) => file !== rootPackagePath);
}

async function getPackages(pattern) {
  const packageFiles = discoverPackagePaths(pattern);
  
  const packages = [];

  for (const packageFile of packageFiles) {
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
      logWarning(`Error parsing package.json: ${error.message}`);
    }
  }

  return packages.sort((a, b) => a.name.localeCompare(b.name));
}

async function getPublishablePackages(pattern) {
  const allPackages = await getPackages(pattern);
  return allPackages.filter(pkg => !pkg.private);
}

module.exports = {
  getPackages,
  getPublishablePackages
}; 