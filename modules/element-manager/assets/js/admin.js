import { createRoot } from '@wordpress/element';
import domReady from '@wordpress/dom-ready';

import { AppModern } from './app-editor-one';
import { AppLegacy } from './app';

domReady( () => {
	const htmlOutput = document.getElementById( 'elementor-element-manager-wrap' );

	if ( ! htmlOutput ) {
		return;
	}

	const isEditorOneEnabled = typeof elementorCommon !== 'undefined' &&
		true === elementorCommon.config?.experimentalFeatures?.e_editor_one;

	const root = createRoot( htmlOutput );

	if ( isEditorOneEnabled ) {
		root.render( <AppModern /> );
	} else {
		root.render( <AppLegacy /> );
	}
} );
