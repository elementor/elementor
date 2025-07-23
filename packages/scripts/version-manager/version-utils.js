const { BUMP_TYPES } = require('./constants');

/**
 * Apply tag suffix to version
 */
function applyTag(version, tag) {
  if (!tag) {
    return version;
  }

  // Remove any existing pre-release tags
  const cleanVersionStr = cleanVersion(version);
  
  // Add the new tag
  return `${cleanVersionStr}-${tag}`;
}

/**
 * Clean version string
 */
function cleanVersion(version) {
  // Simple version cleaning - remove pre-release tags
  return version.split('-')[0];
}

/**
 * Get the highest version from a list of packages
 */
function getHighestVersion(packages) {
  const versions = packages.map(pkg => pkg.currentVersion);
  const validVersions = versions.filter(version => isValidVersion(version));
  
  if (validVersions.length === 0) {
    throw new Error('No valid semver versions found in packages');
  }

  return validVersions.reduce((highest, current) => {
    return compareVersions(current, highest) > 0 ? current : highest;
  });
}

/**
 * Simple version comparison
 */
function compareVersions(v1, v2) {
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
function isValidVersion(version) {
  return /^\d+\.\d+\.\d+/.test(version);
}

/**
 * Increment version
 */
function incrementVersion(version, type) {
  if (!BUMP_TYPES.includes(type)) {
    throw new Error(`Invalid bump type: ${type}. Must be one of: ${BUMP_TYPES.join(', ')}`);
  }

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

module.exports = {
  applyTag,
  cleanVersion,
  getHighestVersion,
  compareVersions,
  isValidVersion,
  incrementVersion
}; 