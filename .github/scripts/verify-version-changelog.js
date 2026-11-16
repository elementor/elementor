'use strict';

const fs = require('fs');
const { VERSION } = process.env;
const {
	assertValidVersion,
	getVersionHeaderPattern,
	getVersionSectionPattern,
} = require('./changelog-utils');

const CHANGELOG_FILES = ['changelog.txt', 'readme.txt'];

if (!VERSION) {
	console.error('missing VERSION env var');
	process.exit(1);
}

try {
	assertValidVersion(VERSION);
} catch (err) {
	console.error(err.message);
	process.exit(1);
}

for (const fileName of CHANGELOG_FILES) {
	try {
		const fileContent = fs.readFileSync(fileName, 'utf-8');

		if (!getVersionHeaderPattern(VERSION).test(fileContent)) {
			console.error(`Changelog for release ${VERSION} not found in ${fileName}`);
			process.exit(1);
		}

		const sectionMatch = fileContent.match(getVersionSectionPattern(VERSION));
		const versionLog = sectionMatch?.[1]?.trim();

		if (!versionLog) {
			console.error(`Changelog for release ${VERSION} is empty in ${fileName}`);
			process.exit(1);
		}

		fs.writeFileSync(`temp-${fileName}`, versionLog);
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
}
