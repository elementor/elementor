import EditorTest from './js/editor-test';

function initialize() {
	const $body = jQuery( 'body' ).append( '<div id="elementor-test"></div>' ),
		$elementorFake = $body.find( '#elementor-test' );

	// Load the template to `#elementor-test`.
	$elementorFake.append( window.__html__[ 'tests/qunit/index.html' ] );

	window.elementor = new EditorTest();

	// Mock document for `initDocument`;
	const request = {
			unique_id: `document-1`,
			data: { id: 1 },
		},
		cacheKey = elementorCommon.ajax.getCacheKey( request );
	elementorCommon.ajax.cache[ cacheKey ] = elementor.getConfig().document;

	elementor.on( 'preview:loaded', () => {
		require( './core/common/components/components.spec' );

		require( './core/common/components/base/callbacks.spec.js' );
		require( './core/editor/container/container.spec' );
		require( './core/editor/document/commands/base/base.spec' );
		require( './core/editor/document/commands/base/history.spec' );
		require( './core/editor/document/dynamic/commands/base/disable-enable.spec' );
		require( './core/editor/document/component.spec' );
		require( './core/editor/document/manager.spec' );
		require( './core/editor/document/elements/component.spec' );
		require( './core/editor/document/repeater/component.spec' );
		require( './core/editor/document/dynamic/component.spec' );
		require( './core/editor/document/history/component.spec' );
		require( './core/editor/document/ui/component.spec' );
	} );

	elementor.start();

	elementor.$preview.trigger( 'load' );
}

jQuery( initialize );
