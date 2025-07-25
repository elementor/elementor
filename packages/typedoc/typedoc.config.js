/**
 * @type {import('typedoc').TypeDocOptions}
 */
module.exports = {
	entryPoints: [
		'../packages/core/editor',
		'../packages/core/editor-app-bar',
		'../packages/libs/env',
		'../packages/libs/locations',
		'../packages/libs/query',
	],
	entryPointStrategy: 'packages',
	out: '../docs/api',
	hideGenerator: true,
	cleanOutputDir: true,
	name: 'Elementor Packages API Reference',
	readme: './intro.md',
};
