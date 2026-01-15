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

	// Conflict with above rule.
	'core/files/assets/**',
	'vendor/autoload.php',
	'vendor/composer/**',
<<<<<<< HEAD
=======
	'vendor/elementor/wp-one-package/**',
	'vendor/elementor/wp-notifications-package/**',
>>>>>>> a3da68c7b1 (Fix: What’s New panel is empty when only Editor Core is installed [ACD-7976] (#34269))
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
