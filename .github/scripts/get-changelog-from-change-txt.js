'use strict';

const marked = require("marked");
const fs = require('fs');
const { VERSION } = process.env;

if (!VERSION) {
	console.error('missing VERSION env var');
	process.exit(1);
	return;
}

for (let fileName of ['readme', 'changelog'] ) {
	(async () => {
		try {
			const changelogText = fs.readFileSync(`${fileName}.txt`, 'utf-8');
			const data = marked.lexer(changelogText);
			const headerIndex = data.findIndex((section) => section.type === 'paragraph' && section.text.trim().startsWith(VERSION));
			if (headerIndex === -1) {
				console.error(`Failed to find version: ${VERSION} in ${fileName}.txt file`);
				process.exit(1);
				return;
			}
			const versionLog = data[headerIndex + 1].raw;
			fs.writeFileSync(`temp-${fileName}.txt`, versionLog);
			console.log('success: ', fileName);
		} catch (err) {
			console.error('this is my error', fileName, err)
			process.exit(1);
		}
	})();
}
