'use strict';

const { CHANGELOG_FILE, getChangelogSection } = require('./get-changelog-section');

// Slack rejects section text over 3000 characters.
const SLACK_SECTION_MAX_LENGTH = 3000;
const TRUNCATION_NOTE = '…and more in the release notes';

// Slack treats &, < and > as control characters in mrkdwn.
const SLACK_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;' };

const toSlackLine = (line) =>
	line
		.replace(/[&<>]/g, (char) => SLACK_ESCAPES[char])
		.replace(/^\*\s+/, '• ')
		.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<$2|$1>');

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

// Prints the Slack-formatted changelog, or nothing when the version has none (e.g. betas).
// Never fails, so a changelog problem cannot block the release announcement.
if (require.main === module) {
	try {
		process.stdout.write(getSlackChangelog(process.argv[2] || ''));
	} catch (err) {
		console.error(err.message);
	}
}
