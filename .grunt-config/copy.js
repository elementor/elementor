/**
 * Grunt copy task config
 * @package Elementor
 */
const getBuildFiles = [
	'**',
	'!node_modules/**',
	'!docs/**',
	'!build/**',
	'!local-site/**',
	'!bin/**',
	'!.git/**',
	'!tests/**',
	'!.github/**',
	'!.travis.yml',
	'!.jscsrc',
	'!.jshintignore',
	'!.jshintrc',
	'!ruleset.xml',
	'!README.md',
	'!phpunit.xml',
	'!vendor/**',
	'!Gruntfile.js',
	'!package.json',
	'!package-lock.json',
	'!npm-debug.log',
	'!composer.json',
	'!cypress.json',
	'!composer.lock',
	'!.gitignore',
	'!.gitmodules',
	'!yarn.lock',
	'!docker-compose.yml',
	'!nightwatch.conf.js',
	'!assets/dev/**',
	'!assets/**/*.map',
	'!modules/**/assets/**',
	'!core/**/assets/**',
	'!*~',

	// Conflict with above rule.
	'core/files/assets/**',
];
/**
 * @type {{main: {src: string[], expand: boolean, dest: string}, secondary: {src: string[], expand: boolean, dest: string}}}
 */
const copy = {
	main: {
		src: getBuildFiles,
		expand: true,
		dest: 'build/'
	},
	secondary: {
		src: getBuildFiles,
		expand: true,
		dest: '/tmp/elementor-builds/<%= pkg.version %>/'
	}
};

module.exports = copy;
