'use strict';

const fs = require('fs');

const CHANGELOG_FILE = 'changelog.txt';

const escapeVersionForRegex = (version) => version.replace(/\./g, '\\.');

const getVersionHeaderPattern = (version) =>
	new RegExp(`^= ${escapeVersionForRegex(version)} - \\d{4}-\\d{2}-\\d{2} =\\s*$`, 'm');

const getVersionSectionPattern = (version) =>
	new RegExp(
		`^= ${escapeVersionForRegex(version)} - \\d{4}-\\d{2}-\\d{2} =\\s*\\n+([\\s\\S]*?)(?=^= \\d+\\.\\d+\\.\\d+ - \\d{4}-\\d{2}-\\d{2} =|(?![\\s\\S]))`,
		'm'
	);

const getChangelogSection = (version, filePath = CHANGELOG_FILE) => {
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

	const section = getChangelogSection(version);

	if (!section) {
		console.error(`Changelog for ${version} not found in ${CHANGELOG_FILE}`);
		process.exit(1);
	}

	process.stdout.write(section);
}
