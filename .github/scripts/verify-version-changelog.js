'use strict';

const fs = require('fs');
const { VERSION } = process.env;

const CHANGELOG_FILES = ['changelog.txt', 'readme.txt'];

const escapeVersionForRegex = (version) => version.replace(/\./g, '\\.');

const getVersionHeaderPattern = (version) =>
	new RegExp(`^= ${escapeVersionForRegex(version)} - \\d{4}-\\d{2}-\\d{2} =\\s*$`, 'm');

const getVersionSectionPattern = (version) =>
	new RegExp(
		`^= ${escapeVersionForRegex(version)} - \\d{4}-\\d{2}-\\d{2} =\\s*\\n+([\\s\\S]*?)(?=^= \\d+\\.\\d+\\.\\d+ - |\\Z)`,
		'm'
	);

if (!VERSION) {
	console.error('missing VERSION env var');
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
