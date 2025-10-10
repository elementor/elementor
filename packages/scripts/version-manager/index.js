#!/usr/bin/env node

const program = require('./cli');

async function main() {
  try {
    await program.parseAsync();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  main
}; 