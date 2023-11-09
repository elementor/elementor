import { render } from '@wordpress/element';
import domReady from '@wordpress/dom-ready';

import { App } from './app';

domReady( () => {
	const htmlOutput = document.getElementById( 'elementor-element-manager-wrap' );

	if ( htmlOutput ) {
		render( <App />, htmlOutput );
	}
} );
