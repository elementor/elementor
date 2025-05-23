/**
 * Grunt copy task config
 * @package Elementor
 */
const getBuildFiles = [
	'**',
	'!.git/**',
	'!.github/**',
	'!.run/**',
	'!.gitignore',
	'!.gitmodules',
	'!.jscsrc',
	'!karma.conf.js',
	'!.jshintignore',
	'!.jshintrc',
	'!.travis.yml',
	'!app/**/assets/**',
	'!assets/**/*.map',
	'!assets/dev/**',
	'!assets/js/qunit-tests*',
	'!bin/**',
	'!build/**',
	'!composer.json',
	'!composer.lock',
	'!core/**/assets/**',
	'!cypress.json',
	'!docker-compose.yml',
	'!docs/**',
	'!Gruntfile.js',
	'!local-site/**',
	'!logo.png',
	'!modules/**/assets/**',
	'!nightwatch.conf.js',
	'!node_modules/**',
	'!npm-debug.log',
	'!package-lock.json',
	'!package.json',
	'!packages/**',
	'!phpunit.xml',
	'!CHANGELOG.md',
	'!README.md',
	'!ruleset.xml',
	'!tests/**',
	'!test-results/',
	'!tmp/**',
	'!vendor/**',
	'!yarn.lock',
	'!*~',
	'!commitlint.config.js',

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
