'use strict';

const packageJson = require('../../package.json');
const { last_beta_version = '', version } = packageJson;
const semver = require('semver');

(() => {
	const versionOfBeta = last_beta_version.split('-')[0];
	if (versionOfBeta && semver.gt(versionOfBeta, version)) {
		console.log(last_beta_version);
	}
})();
