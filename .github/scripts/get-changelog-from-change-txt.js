'use strict';

const marked = require("marked");
const fs = require('fs');
const { VERSION } = process.env;

if (!VERSION) {
	console.error('missing VERSION env var');
	process.exit(1);
	return;
}

for (let fileName of ['changelog', 'readme'] ) {
	(async () => {
		try {
			const changelogText = fs.readFileSync(`${fileName}.txt`, 'utf-8');
			const data = marked.lexer(changelogText);
			const headerIndex = data.findIndex((section, index) => {
				const text = section?.text?.match(/\d+\.\d+\.\d+/g)?.[0] || ''
				if (index < 10) console.log(1, section.type, 2, section.text, 3, text);
				return section.type === 'paragraph' && VERSION == text;
			});
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
