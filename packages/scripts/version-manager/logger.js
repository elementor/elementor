const { colors } = require('./constants');

function log(message, color = '') {
  console.log(`${color}${message}${colors.reset}\n`);
}

function logError(message) {
  console.error(`${colors.red}Error:${colors.reset} ${message}\n`);
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