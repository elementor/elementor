'use strict';

const marked = require("marked");
const fs = require('fs');
const { VERSION } = process.env;

if (!VERSION) {
	console.error('missing VERSION env var');
	process.exit(1);
	return;
}

for (let fileName of ['changelog.txt', 'readme.txt'] ) {
	try {
		const changelogText = fs.readFileSync(`${fileName}`, 'utf-8');
		const data = marked.lexer(changelogText);
		const headerIndex = data.findIndex((section) => {
			const text = section?.text?.match(/\d+\.\d+\.\d+/g)?.[0] || '';
			return section.type === 'paragraph' && VERSION == text;
		});
		if (headerIndex === -1) {
			console.error(`Change log for release ${version} not found in ${filename}`);
			process.exit(1);
			return;
		}
		const versionLog = data[headerIndex + 1].raw;
		fs.writeFileSync(`temp-${fileName}`, versionLog);
	} catch (err) {
		console.error(err)
		process.exit(1);
	}
}
