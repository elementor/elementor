const { colors } = require('./constants');

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

module.exports = {
  log,
  logError,
  logSuccess,
  logInfo,
  logWarning
}; 