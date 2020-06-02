import EditorTest from './js/editor-test';
import * as Ajax from './mock/ajax/';
import * as eData from './mock/e-data/';

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
	eData.silence();

	elementor.on( 'preview:loaded', () => {
		// Disable UI Hooks.
		$e.hooks.ui.deactivate();

		require( './core/common/assets/js/api/modules/command-base.spec.js' );
		require( './core/common/assets/js/api/modules/command-data.spec.js' );

		require( './core/common/assets/js/api/core/components.spec.js' );
		require( './core/common/assets/js/api/core/data.spec.js' );

		require( './core/common/assets/js/api/core/hooks/base.spec.js' );

		require( './core/editor/container/container.spec' );

		require( './core/editor/document/commands/base/command-history.spec' );
		require( './core/editor/document/dynamic/commands/base/disable-enable.spec' );

		require( './core/editor/document/component.spec' );
		require( './core/editor/document/manager.spec' );

		require( './core/editor/document/elements/component.spec' );
		require( './core/editor/document/repeater/component.spec' );
		require( './core/editor/document/dynamic/component.spec' );
		require( './core/editor/document/history/component.spec' );
		require( './core/editor/document/ui/component.spec' );
		require( './core/editor/document/save/component.spec' );
	} );

	elementor.start();

	elementor.$preview.trigger( 'load' );
}

jQuery( initialize );
