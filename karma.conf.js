const karmaParameters = [];

if ( process.argv[ process.argv.length - 1 ] ) {
	process.argv[ process.argv.length - 1 ].split( ':' ).forEach(
		( param ) => karmaParameters.push( param )
	);

	// Remove 'karma'.
	karmaParameters.shift();
}

const isDebug = karmaParameters.includes( 'debug' );

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
			'assets/lib/backbone/backbone.marionette.min.js',
			'assets/lib/backbone/backbone.radio.min.js',

			// Elementor Common.
			'tests/qunit/setup/common/setup-elementor-common.js',
			'assets/lib/dialog/dialog.js',
			'assets/js/common-modules.js',
			'assets/js/common.js',

			// // Editor Fixtures.
			// 'tests/qunit/index.html',
			//
			// // Editor Tinymce.
			// 'tests/qunit/setup/editor/setup-tinymce.js',
			// 'tests/qunit/vendor/wp-includes/quicktags.min.js',
			//
			// // Editor Config.
			// 'tests/qunit/setup/editor/setup-editor.js',
			//
			// // Editor Dependencies.
			// 'tests/qunit/vendor/wp-includes/jquery-ui.min.js',
			// 'assets/lib/tipsy/tipsy.min.js',
			// 'assets/lib/perfect-scrollbar/js/perfect-scrollbar.min.js',
			// 'assets/lib/nouislider/nouislider.min.js',
			// 'assets/lib/imagesloaded/imagesloaded.min.js',
			// 'assets/dev/js/editor/utils/jquery-serialize-object.js',
			// 'assets/dev/js/editor/utils/jquery-html5-dnd.js',
			// 'assets/lib/jquery-hover-intent/jquery-hover-intent.min.js',
			//
			// // Editor.
			// 'assets/js/editor-modules.js',
			// 'assets/js/editor-document.js',
			//
			// // Tests.
			// 'assets/js/qunit-tests.js',
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
			// enforce percentage thresholds
			// anything under these percentages will cause karma to fail with an exit code of 1 if not running in watch mode
			thresholds: {
				emitWarning: false, // set to `true` to not fail the test command when thresholds are not met
				// thresholds for all files
				global: {
					statements: 50, /* TEMP: initial value */
					lines: 55, /* TEMP: initial value */
					branches: 25, /* TEMP: initial value */
					functions: 55, /* TEMP: initial value */
				},
			},
		},
		// web server port
		port: 9876,
		colors: true,
		logLevel: config.LOG_INFO,
		browsers: [ 'ChromeHeadless' ],
		// Continuous Integration mode
		// if true, Karma captures browsers, runs the tests and exits
		singleRun: true,

		// client configuration
		client: {
			clearContext: true,
			qunit: {
				isDebug,
				showUI: false,
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

	if ( ! karmaParameters[ 2 ] || 'editor' === karmaParameters[ 2 ] ) {
		const setupEditor = require( '../elementor/tests/qunit/setup/editor/setup-editor' );

		setupEditor( karmaConfig );
	}
};
