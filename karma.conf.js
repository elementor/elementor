let isDebug = false;

if ( process.argv[ process.argv.length - 1 ] ) {
	const gruntParams = process.argv[ process.argv.length - 1 ].split( ':' );

	if ( gruntParams ) {
		if ( 'karma' === gruntParams[ 0 ] ) {
			if ( 'debug' === gruntParams[ 1 ] ) {
				isDebug = true;
			}
		}
	}
}

// Read package.json
const packageJson = require( './package.json' );

module.exports = function( config ) {
	const karmaConfig = {
		basePath: './',
		frameworks: [ 'qunit' ],
		files: [
			{
				pattern: 'assets/js/**/*.js.map',
				included: false,
			},

			// Base Libraries.
			'tests/qunit/vendor/wp-includes/jquery.js',
			'tests/qunit/vendor/wp-includes/underscore.min.js',
			'tests/qunit/vendor/wp-includes/backbone.min.js',
			'tests/qunit/vendor/wp-includes/react.min.js',
			'tests/qunit/vendor/wp-includes/react-dom.min.js',
			'tests/qunit/vendor/wp-includes/i18n.min.js',
			'assets/lib/backbone/backbone.marionette.min.js',
			'assets/lib/backbone/backbone.radio.min.js',

			// Dev tools.
			'tests/qunit/setup/dev-tools.js',
			'assets/js/dev-tools.js',

			// Elementor Common.
			'tests/qunit/setup/elementor-common.js',
			'tests/qunit/setup/web-cli.js',
			'assets/lib/dialog/dialog.js',
			'assets/js/common-modules.min.js',
			'assets/js/web-cli.min.js',
			'assets/js/common.min.js',

			// Editor Fixtures.
			'tests/qunit/index.html',

			// Editor Tinymce.
			'tests/qunit/setup/tinymce.js',
			'tests/qunit/vendor/wp-includes/quicktags.min.js',

			// Editor Config.
			'tests/qunit/setup/editor.js',

			// Editor Dependencies.
			'tests/qunit/vendor/wp-includes/jquery-ui.min.js',
			'assets/lib/tipsy/tipsy.min.js',
			'assets/lib/perfect-scrollbar/js/perfect-scrollbar.min.js',
			'assets/lib/nouislider/nouislider.min.js',
			'assets/lib/imagesloaded/imagesloaded.min.js',
			'assets/dev/js/editor/utils/jquery-serialize-object.js',
			'assets/dev/js/editor/utils/jquery-html5-dnd.js',
			'assets/lib/jquery-hover-intent/jquery-hover-intent.min.js',

			// Editor.
			'assets/js/editor-modules.min.js',
			'assets/js/editor-document.min.js',

			// Tests.
			'assets/js/qunit-tests.min.js',
		],
		preprocessors: {
			'tests/qunit/index.html': [ 'html2js' ],
			'assets/js/common-modules.js': [ 'coverage' ],
			'assets/js/common.js': [ 'coverage' ],
			'assets/js/editor-document.js': [ 'coverage' ],

		},
		reporters: [ 'progress' ],
		coverageIstanbulReporter: {
			reports: [ 'text' ],
			fixWebpackSourcePaths: true,
			// Enforce percentage thresholds
			// anything under these percentages will cause karma to fail with an exit code of 1 if not running in watch mode
			thresholds: {
				emitWarning: false, // Set to `true` to not fail the test command when thresholds are not met
				// thresholds for all files
				global: {
					statements: 50, /* TEMP: initial value */
					lines: 55, /* TEMP: initial value */
					branches: 25, /* TEMP: initial value */
					functions: 55, /* TEMP: initial value */
				},
			},
		},
		// Web server port
		port: 9876,
		colors: true,
		logLevel: config.LOG_INFO,
		browsers: [ 'ChromeHeadlessCustom', 'ChromeHeadless' ],
		customLaunchers: {
			ChromeHeadlessCustom: {
				base: 'ChromeHeadless',
				flags: [ '--no-sandbox', '--disable-dev-shm-usage' ],
			},
		},
		browserDisconnectTimeout: 6000,
		pingTimeout: 10000,
		// Continuous Integration mode
		// if true, Karma captures browsers, runs the tests and exits
		singleRun: true,

		// Client configuration
		client: {
			clearContext: true,
			qunit: {
				elementorVersion: packageJson.version,
				isDebug,
				showUI: false,
				validateContainersAlive: true, // Validate all containers are alive recursively after each test done.
				testTimeout: 5000,
			},
		},
	};

	if ( isDebug ) {
		const fs = require( 'fs' );

		if ( fs.existsSync( '../elementor-dev-tools' ) ) {
			const last = karmaConfig.files.pop();

			karmaConfig.files.push( { pattern: '../elementor-dev-tools/assets/js/editor.js', type: 'module' } );

			karmaConfig.files.push( last );
		}
	}

	config.set( karmaConfig );
};
