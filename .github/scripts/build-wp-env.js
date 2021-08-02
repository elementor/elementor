'use strict';

const fs = require('fs');

const wpEnv = require('../../.wp-env.json');
const { PHP_VERSION, WP_CORE_VERSION } = process.env;

if (!PHP_VERSION) {
	console.error('missing env var PHP_VERSION');
	process.exit(1);
	return;
}

if (!WP_CORE_VERSION) {
	console.error('missing env var WP_CORE_VERSION');
	process.exit(1);
	return;
}

let wpCore = null;

if (WP_CORE_VERSION !== 'latest') {
	wpCore = `WordPress/WordPress#${WP_CORE_VERSION}`;
}

wpEnv.phpVersion = PHP_VERSION;
wpEnv.core = wpCore;

fs.writeFileSync('.wp-env.json', JSON.stringify(wpEnv, null, 4));
