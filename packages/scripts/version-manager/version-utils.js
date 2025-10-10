const semver = require('semver');
const { BUMP_TYPES } = require('./constants');

function applyTag(version, tag) {
  if (!tag) {
    return version;
  }

  const cleanVersion = semver.clean(version);
  if (!cleanVersion) {
    throw new Error(`Invalid version: ${version}`);
  }

  return `${cleanVersion}-${tag}`;
}

function cleanVersion(version) {
  const cleaned = semver.clean(version);
  if (!cleaned) {
    throw new Error(`Invalid version: ${version}`);
  }
  return cleaned;
}

function getHighestVersion(packages) {
  const versions = packages.map(pkg => pkg.currentVersion);
  const validVersions = versions.filter(version => semver.valid(version));
  
  if (validVersions.length === 0) {
    throw new Error('No valid semver versions found in packages');
  }

  return validVersions.reduce((highest, current) => {
    return semver.gt(current, highest) ? current : highest;
  });
}

function compareVersions(v1, v2) {
  return semver.compare(v1, v2);
}

function isValidVersion(version) {
  return semver.valid(version) !== null;
}

function incrementVersion(version, type) {
  if (!BUMP_TYPES.includes(type)) {
    throw new Error(`Invalid bump type: ${type}. Must be one of: ${BUMP_TYPES.join(', ')}`);
  }

  const cleanVer = semver.clean(version);
  if (!cleanVer) {
    throw new Error(`Invalid version: ${version}`);
  }

  const newVersion = semver.inc(cleanVer, type);
  if (!newVersion) {
    throw new Error(`Failed to increment version: ${version} (${type})`);
  }

  return newVersion;
}

module.exports = {
  applyTag,
  cleanVersion,
  getHighestVersion,
  compareVersions,
  isValidVersion,
  incrementVersion
}; 