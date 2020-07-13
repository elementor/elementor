import EditorTest from './js/editor-test';
import * as Ajax from './mock/ajax/';
import * as eData from './mock/e-data/';
import tests from './';

function initialize() {
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

	Ajax.silence();
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
