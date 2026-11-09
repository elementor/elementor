'use strict';

const { CHANGELOG_FILE, getChangelogSection } = require('./get-changelog-section');

// Slack rejects section text over 3000 characters.
const SLACK_SECTION_MAX_LENGTH = 3000;
const TRUNCATION_NOTE = '…and more in the release notes';

// Slack treats &, < and > as control characters in mrkdwn.
const SLACK_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;' };

// Captures [label](url). With split(), parts cycle as: text, label, url, text, ...
const MARKDOWN_LINK = /\[([^\]]+)\]\((https?:\/\/[^\s()<>|]+)\)/;

const escapeForSlack = (text) => text.replace(/[&<>]/g, (char) => SLACK_ESCAPES[char]);

// Escapes text and labels but keeps link URLs as they are, so query strings still work.
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

	// Keep whole lines only, leaving room for the truncation note.
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

const getSlackChangelog = (version, filePath = CHANGELOG_FILE) => {
	const section = getChangelogSection(version.replace(/^v/, ''), filePath);

	return section ? formatChangelogForSlack(section) : '';
};

module.exports = {
	formatChangelogForSlack,
	getSlackChangelog,
};

// Prints the Slack-formatted changelog. A version without a section (e.g. a beta) prints nothing
// and exits 0. Any other problem exits 1, so the caller can report it.
if (require.main === module) {
	try {
		process.stdout.write(getSlackChangelog(process.argv[2] || ''));
	} catch (err) {
		console.error(err.message);
		process.exitCode = 1;
	}
}
