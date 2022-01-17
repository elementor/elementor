'use strict';

const semverInc = require('semver/functions/inc');
const packageJson = require('../../package.json');
const fs = require('fs');

const preId = process.argv[2];
if (!['dev', 'beta'].includes(preId)) {
	console.error('missing argument dev or beta mode');
	process.exit(1);
	return;
}

const bumpVersion = (relativeVersion, lastVersionTagName, bumpsFromCurrentVersion = 1) => {
	const lastVersion = packageJson[lastVersionTagName] || '';
	let expectedVersion = relativeVersion;
	(new Array(bumpsFromCurrentVersion).fill(1)).forEach(() => {
		expectedVersion = semverInc(expectedVersion, 'minor');
	});
	let currentLastVersionNumber = 0;

	if (lastVersion) {
		const splitVersion = lastVersion.split(`-${preId}`);
		if (splitVersion[0] === expectedVersion) {
			const currentLastVersion = splitVersion[splitVersion.length - 1];
			currentLastVersionNumber = Number(currentLastVersion);
			if (Number.isNaN(currentLastVersionNumber)) {
				console.error(`invalid ${preId} version: ${currentLastVersion}`);
				process.exit(1);
				return;
			}
		}
	}

	const newVersion = `${expectedVersion}-${preId}${currentLastVersionNumber + 1}`;
	packageJson[lastVersionTagName] = newVersion;
	fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 4));
	console.log(newVersion);
}

if (preId === 'beta') {
	const relativeVersion = packageJson.version;
	bumpVersion(relativeVersion, 'last_beta_version');
	return;
}

if (preId === 'dev') {
	const lastBetaVersion = (() => {
		const attrValue = packageJson.last_beta_version;
		if (!attrValue) {
			return '';
		}
		return attrValue.split('-')[0];
	})();
	const relativeVersion = lastBetaVersion || packageJson.version;
	bumpVersion(relativeVersion, 'last_dev_version');
}
