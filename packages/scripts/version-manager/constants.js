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

const WORKSPACE_PATTERNS = ['core/*', 'libs/*', 'tools/*'];

const BUMP_TYPES = ['patch', 'minor', 'major'];

const DEPENDENCY_TYPES = ['dependencies', 'devDependencies', 'peerDependencies'];

module.exports = {
  colors,
  WORKSPACE_PATTERNS,
  BUMP_TYPES,
  DEPENDENCY_TYPES
}; 