import tests from './';

/* global require */

function initialize() {
		const EditorTest = require( './js/editor-test' ).default,
			ajax = require( './mock/ajax/' ),
			eData = require( './mock/e-data/' );

	const $body = jQuery( 'body' ).append( '<div id="elementor-test"></div>' ),
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

		tests();
	} );

	elementor.start();

	elementor.$preview.trigger( 'load' );
}

if ( ! window.elementor ) {
	jQuery( initialize );
}
