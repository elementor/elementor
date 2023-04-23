import tests from '../tests';

export default class EditorBootstrap {
	constructor() {
		jQuery( this.initialize.bind( this ) );
	}

	initialize() {
		this.initializeTestUtils();

		const EditorTest = require( './test' ).default,
			ajax = require( '../mock/ajax' ),
			eData = require( '../mock/e-data' ),
			$body = jQuery( 'body' ).append( '<div id="elementor-test"></div>' ),
			$elementorTest = $body.find( '#elementor-test' );

		// Load the template to `#elementor-test`.
		$elementorTest.append( window.__html__[ 'tests/qunit/index.html' ] );

		window.elementor = new EditorTest();

		// Mock document for `initDocument`;
		const request = {
				unique_id: `document-1`,
				data: { id: 1 },
			},
			cacheKey = elementorCommon.ajax.getCacheKey( request );
		elementorCommon.ajax.cache[ cacheKey ] = elementor.getConfig().document;

		ajax.silence();
		eData.emptyFetch();

		elementor.on( 'preview:loaded', () => {
			// Disable UI Hooks.
			$e.hooks.ui.deactivate();

			this.runTests();
		} );

		elementor.start();

		this.bypassRemoteBehaviour();

		elementor.$preview.trigger( 'load' );
	}

	/**
	 * Function initializeTestUtils().
	 * Since JS API catch errors that occurs while running commands, the tests should expect it.
	 * Using this function, it can catch the errors and report them to QUnit.
	 */
	initializeTestUtils() {
		const exceptCatchApply = [];
		const catchApplyOrig = $e.commands.catchApply;

		if ( ! $e.tests ) {
			$e.tests = {};
		}

		// Use `$e.tests.commands.exceptCatchApply()` to except the catch errors.
		$e.tests.commands = {
			exceptCatchApply: ( callback, count = 1 ) => {
				for ( let i = 0; i < count; ++i ) {
					exceptCatchApply.push( ( e, instance ) => callback( e, instance ) );
				}
			},
		};

		// Override `$e.commands.catchApply()` to catch the errors that are excepted.
		$e.commands.catchApply = ( e, instance ) => {
			catchApplyOrig( e, instance );

			if ( exceptCatchApply.length ) {
				exceptCatchApply.pop()( e, instance );
			} else {
				throw new Error( e );
			}
		};
	}

	bypassRemoteBehaviour() {
		elementor.modules.elements.models.Element.prototype.renderRemoteServer = () => {};
		elementor.helpers.fetchFa4ToFa5Mapping.prototype = () => {};
	}

	runTests() {
		return tests();
	}
}
