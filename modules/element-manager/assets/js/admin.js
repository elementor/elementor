import { createRoot } from '@wordpress/element';
import domReady from '@wordpress/dom-ready';

import { AppModern } from './app-editor-one';

domReady( () => {
	const htmlOutput = document.getElementById( 'elementor-element-manager-wrap' );

	if ( ! htmlOutput ) {
		return;
	}

	const root = createRoot( htmlOutput );

	root.render( <AppModern /> );
} );
