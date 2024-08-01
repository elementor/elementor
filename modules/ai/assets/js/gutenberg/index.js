import { createRoot } from '@wordpress/element';
import GenerateExcerptWithAI from './excerpt';
import GenerateFeaturedImageWithAI from './featured-image';
import { GenerateTextWithAi } from './text-with-ai';
import React from 'react';
import { EditTextWithAi } from './edit-text-with-ai';
import { getUniqueId } from '../editor/context/requests-ids';

( function() {
	'use strict';
	window.EDITOR_SESSION_ID = getUniqueId( 'wp-gutenberg-session' );
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
				excerptPanel.appendChild( rootElement );

				const urlSearchParams = new URLSearchParams( window.location.search );
				elementorCommon?.ajax?.addRequestConstant( 'editor_post_id', urlSearchParams?.get( 'post' ) );

				const root = createRoot( rootElement );
				root.render( <GenerateExcerptWithAI /> );
			}
		};

		const addGenerateFeaturedImageWithAI = () => {
			const featuredImagePanel = document.querySelector( '.editor-post-featured-image' );
			if ( featuredImagePanel && ! document.querySelector( '.e-featured-image-ai' ) ) {
				const rootElement = document.createElement( 'div' );
				rootElement.classList.add( 'e-featured-image-ai' );
				featuredImagePanel.appendChild( rootElement );
				const postId = wp.data.select( 'core/editor' ).getCurrentPostId();
				elementorCommon?.ajax?.addRequestConstant( 'editor_post_id', postId );
				const root = createRoot( rootElement );
				root.render( <GenerateFeaturedImageWithAI /> );
			}
		};

		const addTextWithAI = ( blockName, blockClientId ) => {
			const textPanel = document.querySelector( '.block-editor-block-card__description, .block-editor-block-card__content' );
			if ( textPanel && ! document.querySelector( `.e-text-ai[data-client-id="${ blockClientId }"]` ) ) {
				removeAiIndicator();
				const rootElement = document.createElement( 'div' );
				rootElement.classList.add( 'e-text-ai' );
				rootElement.setAttribute( 'data-client-id', blockClientId );
				textPanel.appendChild( rootElement );
				const root = createRoot( rootElement );
				root.render( <GenerateTextWithAi blockName={ blockName } blockClientId={ blockClientId } /> );
			}
		};

		const removeAiIndicator = ( ) => {
			const textPanel = document.querySelector( '.e-text-ai' );
			if ( textPanel ) {
				textPanel.remove();
			}
		};

		const addAiIndicator = ( panelName, functionAddAi ) => {
			const isSidebarOpened = wp.data.select( 'core/edit-post' )?.isEditorPanelOpened( panelName );
			if ( isSidebarOpened ) {
				setTimeout( function() {
					functionAddAi();
				}, 1 );
			}
		};

		const addAiIndicatorToTextBlock = ( blockNames ) => {
			const selectedBlock = wp.data.select( 'core/block-editor' )?.getSelectedBlock();
			if ( selectedBlock && blockNames.some( ( name ) => selectedBlock.name.includes( name ) ) ) {
				addTextWithAI( selectedBlock.name, selectedBlock.clientId );
			} else {
				removeAiIndicator();
			}
		};

		wp.data.subscribe( () => {
			addAiIndicator( 'post-excerpt', addGenerateExcerptWithAI );
			addAiIndicator( 'featured-image', addGenerateFeaturedImageWithAI );
			addAiIndicatorToTextBlock( [ 'paragraph', 'heading' ] );
		} );

		const observer = new MutationObserver( ( mutationsList ) => {
			for ( const mutation of mutationsList ) {
				if ( 'childList' === mutation.type ) {
					if ( document.querySelector( '.editor-post-excerpt' ) ) {
						addGenerateExcerptWithAI();
					}
				}
			}
		} );

		observer.observe( document.body, { childList: true, subtree: true } );
		window.addEventListener( 'beforeunload', () => {
			observer.disconnect();
		} );
	} );
} )( jQuery );

( function( wp ) {
	const { addFilter } = wp.hooks;

	const addAiButtonToToolbar = ( BlockEdit ) => {
		return ( props ) => {
			return <EditTextWithAi { ...props } blockEdit={ BlockEdit } />;
		};
	};

	addFilter( 'editor.BlockEdit', 'elementor-ai-toolbar-button', addAiButtonToToolbar );
} )( window.wp );

( function() {
	'use strict';

	const setElementorWpAiCurrentContext = () => {
		const selectedBlock = wp.data.select( 'core/block-editor' ).getSelectedBlock();
		if ( selectedBlock ) {
			const blockName = 'core/heading' === selectedBlock.name ? 'heading' : selectedBlock.name;
			window.elementorWpAiCurrentContext = {
				widgetType: blockName,
				controlName: blockName,
			};
		} else {
			window.elementorWpAiCurrentContext = null;
		}
	};

	wp.data.subscribe( setElementorWpAiCurrentContext );

	const clearElementorAiCurrentContext = () => {
		window.elementorWpAiCurrentContext = null;
	};

	window.addEventListener( 'beforeunload', clearElementorAiCurrentContext );
} )();
