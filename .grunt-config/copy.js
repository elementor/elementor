/**
 * Grunt copy task config
 * @package Elementor
 */
const getBuildFiles = [
	'**',
	'!.cursor/**',
	'!.vscode/**',
	'!.git/**',
	'!.github/**',
	'!.run/**',
	'!.gitignore',
	'!.gitmodules',
	'!.jscsrc',
	'!karma.conf.js',
	'!phpcs.xml',
	'!tsconfig.json',
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
	'!php-scoper/**',
	'!yarn.lock',
	'!*~',
	'!commitlint.config.js',
	'!scripts/**',
	'!eslint-local-rules.js',
	'!run-on-linux.js',
	'!test*/**',
	'!8888/**',
	'!8889/**',
	'!*.log',
	'!hello-elementor/**',
	'!.env',

	// Conflict with above rule.
	'core/files/assets/**',
	'vendor/autoload.php',
	'vendor/composer/**',
	'vendor/elementor/wp-one-package/**',
];

const copy = {
	main: {
		src: getBuildFiles,
		expand: true,
		dest: 'build/'
	}
};

module.exports = copy;
