'use strict';

const fs = require('fs');
const {
	CHANGELOG_FILE,
	assertValidVersion,
	getVersionHeaderPattern,
	getVersionSectionPattern,
} = require('./changelog-utils');

const getChangelogSection = (version, filePath = CHANGELOG_FILE) => {
	assertValidVersion(version);
	const fileContent = fs.readFileSync(filePath, 'utf-8');

	if (!getVersionHeaderPattern(version).test(fileContent)) {
		return null;
	}

	const sectionMatch = fileContent.match(getVersionSectionPattern(version));

	return sectionMatch?.[1]?.trim() || null;
};

module.exports = {
	CHANGELOG_FILE,
	getChangelogSection,
};

if (require.main === module) {
	const version = process.argv[2];

	if (!version) {
		console.error('Usage: get-changelog-section.js <version>');
		process.exit(1);
	}

	try {
		assertValidVersion(version);
	} catch (err) {
		console.error(err.message);
		process.exit(1);
	}

	const section = getChangelogSection(version);

	if (!section) {
		console.error(`Changelog for ${version} not found in ${CHANGELOG_FILE}`);
		process.exit(1);
	}

	process.stdout.write(section);
}
