/**
 * Grunt clean task config
 * @package Elementor
 */
module.exports = {
	//Clean up build folder
	main: [
		'build'
	],
	qunit: [
		'tests/qunit/index.html',
		'tests/qunit/preview.html'
	]
};
