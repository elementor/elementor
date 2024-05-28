import { createRoot } from '@wordpress/element';
import GenerateExcerptWithAI from './excerpt';

( function() {
	'use strict';

	// Wait for the Gutenberg editor to initialize
	wp.domReady( () => {
		// Define a function to add the custom link to the excerpt panel
		const addGenerateExcerptWithAI = () => {
			// Get the excerpt panel
			const excerptPanel = document.querySelector( '.editor-post-excerpt' );
			// Check if the excerpt panel exists and the custom link hasn't been added
			if ( excerptPanel && ! document.querySelector( '.e-excerpt-ai' ) ) {
				const rootElement = document.createElement( 'div' );
				rootElement.classList.add( 'e-excerpt-ai' );
				// Find the existing link with class "components-external-link"
				const existingExcerptLink = excerptPanel.querySelector( '.components-external-link' );
				if ( existingExcerptLink ) {
					existingExcerptLink.classList.add( 'existing-excerpt-link' );
					// Append the new link before the existing one
					excerptPanel.insertBefore( rootElement, existingExcerptLink );
				} else {
					// Append the new link to the excerpt panel
					excerptPanel.appendChild( rootElement );
				}

				const urlSearchParams = new URLSearchParams( window.location.search );
				elementorCommon?.ajax?.addRequestConstant( 'editor_post_id', urlSearchParams?.get( 'post' ) );

				const root = createRoot( rootElement );
				root.render( <GenerateExcerptWithAI /> );
			}
		};

		// Add the custom link to the excerpt panel when the editor sidebar is rendered
		wp.data.subscribe( () => {
			const isSidebarOpened = wp.data.select( 'core/edit-post' ).isEditorPanelOpened( 'post-excerpt' );
			if ( isSidebarOpened ) {
				setTimeout( function() {
					addGenerateExcerptWithAI();
				}, 1 );
			}
		} );
	} );
} )( jQuery );
