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
	'!phpunit.xml',
	'!CHANGELOG.md',
	'!README.md',
	'!phpcs.xml',
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
	final_release: {
		files: [
			{
				flatten: true,
				expand: true,
				dot: true,
				filter: 'isFile',
				src: [
					'build/<%= pkg.name %>-<%= pkg.version %>.zip'
				],
				dest: '/tmp/elementor-releases/'
			}
		]
	}
};

module.exports = copy;
