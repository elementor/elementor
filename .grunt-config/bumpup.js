/**
 * Grunt bumpup task config
 * @package Elementor
 * @type {{options: {updateProps: {pkg: string}}, file: string}}
 */
module.exports = {
	options: {
		updateProps: {
			pkg: 'package.json'
		}
	},
	file: 'package.json'
};