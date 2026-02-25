#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

const files = process.argv.slice(2);

if (files.length === 0) {
	process.exit(0);
}

const packagesFiles = files.filter((file) => file.startsWith('packages/'));

if (packagesFiles.length === 0) {
	process.exit(0);
}

const relativeFiles = packagesFiles.map((file) => file.replace(/^packages\//, ''));

try {
	execSync(
		`npx eslint --fix ${relativeFiles.map((f) => `"${f}"`).join(' ')}`,
		{
			cwd: path.join(__dirname, '..', 'packages'),
			stdio: 'inherit',
		}
	);
} catch (error) {
	console.error('Lint failed for packages files:', error.message);
	process.exit(1);
}
