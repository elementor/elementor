#!/usr/bin/env node

const { showHelp, handleCommands } = require('./cli');

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }

  await handleCommands(args);
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  main
}; 