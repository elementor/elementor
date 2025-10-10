const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { WORKSPACE_PATTERNS } = require('./constants');
const { logWarning } = require('./logger');

async function getPackages(pattern) {
  const isInPackagesDir = process.cwd().endsWith('packages');
  const basePattern = isInPackagesDir ? 'packages/{core,libs,tools}/*/package.json' : `packages/packages/{${WORKSPACE_PATTERNS.join(',')}}/package.json`;
  const searchPattern = pattern || basePattern;
  
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