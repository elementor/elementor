/**
 * Grunt jshint task config
 * @package Elementor
  * @type {{options: {jshintrc: string}, all: string[]}}
 */
module.exports = {
	options: {
		reporter: require( 'jshint-stylish' ),
		jshintrc: '.jshintrc'
	},
	all: [
		'Gruntfile.js',
		'assets/js/dev/**/*.js'
	]
};