'use strict';

const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../.playwright-wp-lite-env.json');
const wpEnv = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const { PHP_VERSION, WP_CORE_VERSION } = process.env;

if (!PHP_VERSION) {
	console.error('missing env var PHP_VERSION');
	process.exit(1);
}

if (!WP_CORE_VERSION) {
	console.error('missing env var WP_CORE_VERSION');
	process.exit(1);
}

let wpCore = null;
if (WP_CORE_VERSION !== 'latest') {
	wpCore = WP_CORE_VERSION;
}

wpEnv.phpVersion = PHP_VERSION;
wpEnv.core = wpCore;

fs.writeFileSync(configPath, JSON.stringify(wpEnv, null, '\t'));

console.log(`Updated ${configPath}:`);
console.log(`  PHP Version: ${PHP_VERSION}`);
console.log(`  WP Core: ${wpCore === null ? 'latest' : wpCore}`);

