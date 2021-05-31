'use strict';

const marked = require("marked");
const fs = require('fs');
const { VERSION } = process.env;

if (!VERSION) {
	console.error('missing VERSION env var');
	process.exit(1);
	return;
}

(async () => {
	try {
		const changelogText = fs.readFileSync('readme.txt', 'utf-8');
		const data = marked.lexer(changelogText);
		const headerIndex = data.findIndex((section) => section.type === 'paragraph' && section.text.startsWith(`= ${VERSION}`));
		if (headerIndex === -1) {
			console.error(`Failed to find version: ${VERSION} in readme.txt file`);
			process.exit(1);
			return;
		}
		const versionLog = data[headerIndex + 1].raw;
		fs.writeFileSync('temp-changelog-from-readme.txt', versionLog);
	} catch (err) {
		process.exit(1);
	}
})();
