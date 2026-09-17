'use strict';

const CHANGELOG_FILE = 'changelog.txt';

const escapeVersionForRegex = (version) => version.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const VERSION_PATTERN = /^\d+\.\d+\.\d+(-[a-z0-9-]+)?$/i;

const assertValidVersion = (version) => {
	if (!VERSION_PATTERN.test(version)) {
		throw new Error(`Invalid version format: ${version}`);
	}
};

const getVersionHeaderPattern = (version) =>
	new RegExp(`^= ${escapeVersionForRegex(version)} - \\d{4}-\\d{2}-\\d{2} =\\s*$`, 'm');

const getVersionSectionPattern = (version) =>
	new RegExp(
		`^= ${escapeVersionForRegex(version)} - \\d{4}-\\d{2}-\\d{2} =\\s*\\n+([\\s\\S]*?)(?=^= \\d+\\.\\d+\\.\\d+ - \\d{4}-\\d{2}-\\d{2} =|(?![\\s\\S]))`,
		'm'
	);

module.exports = {
	CHANGELOG_FILE,
	assertValidVersion,
	getVersionHeaderPattern,
	getVersionSectionPattern,
};
