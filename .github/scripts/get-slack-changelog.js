'use strict';

const path = require('path');
const { CHANGELOG_FILE, getChangelogSection } = require('./get-changelog-section');

const CHANGELOG_PATH = path.resolve(__dirname, '../..', CHANGELOG_FILE);
const SLACK_SECTION_MAX_LENGTH = 3000;
const TRUNCATION_NOTE = '…and more in the release notes';
const SLACK_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;' };

// split() with these capture groups yields: text, label, url, text, label, url, ..., text
const MARKDOWN_LINK = /\[([^\]]+)\]\((https?:\/\/[^\s()<>|]+)\)/;

const escapeForSlack = (text) => text.replace(/[&<>]/g, (char) => SLACK_ESCAPES[char]);

// URLs are left unescaped so query strings keep working.
const toSlackLine = (line) => {
	const parts = line.replace(/^\*\s+/, '• ').split(MARKDOWN_LINK);
	let result = '';

	for (let i = 0; i < parts.length; i += 3) {
		result += escapeForSlack(parts[i]);

		if (i + 2 < parts.length) {
			result += `<${parts[i + 2]}|${escapeForSlack(parts[i + 1])}>`;
		}
	}

	return result;
};

const formatChangelogForSlack = (section, maxLength = SLACK_SECTION_MAX_LENGTH) => {
	const lines = section
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter(Boolean)
		.map(toSlackLine);

	const budget = maxLength - TRUNCATION_NOTE.length - 1;
	const kept = [];
	let length = -1;

	for (const line of lines) {
		length += line.length + 1;

		if (length > budget) {
			kept.push(TRUNCATION_NOTE);
			break;
		}

		kept.push(line);
	}

	return kept.join('\n');
};

// Pre-releases (e.g. 4.4.0-beta1) have no changelog section, so they get an empty string.
const getSlackChangelog = (version, filePath = CHANGELOG_PATH) => {
	const cleanVersion = version.replace(/^v/, '');
	const section = getChangelogSection(cleanVersion, filePath);

	if (section) {
		return formatChangelogForSlack(section);
	}

	if (cleanVersion.includes('-')) {
		return '';
	}

	throw new Error(`Changelog for ${cleanVersion} not found in ${filePath}`);
};

module.exports = {
	formatChangelogForSlack,
	getSlackChangelog,
};

if (require.main === module) {
	try {
		process.stdout.write(getSlackChangelog(process.argv[2] || ''));
	} catch (err) {
		console.error(err.message);
		process.exitCode = 1;
	}
}
