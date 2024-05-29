import React from 'react';
import ReactDOM from 'react-dom';
import GenerateImageWithAI from './ai-images';
// Import { createRoot } from '@wordpress/element';

( function() {
	const isMediaLibrary = () => {
		const { location } = window;
		return location.href.endsWith( '/upload.php' ) && ! location.search;
	};

	if ( isMediaLibrary() ) {
		const mediaLibrary = document.querySelector( '.page-title-action' );
		if ( mediaLibrary ) {
			const container = document.createElement( 'button' );
			container.id = 'e-image-ai-media-library';
			mediaLibrary.insertAdjacentElement( 'afterend', container );
			ReactDOM.render( <GenerateImageWithAI />, container );
		}
	}

	if ( wp?.media?.view?.Attachment?.Details ) {
		wp.media.view.Attachment.Details = wp.media.view.Attachment.Details.extend( {
			template( view ) {
				const html = wp.media.template( 'attachment-details' )( view );

				if ( this.model.attributes.type !== 'image' ) {
					return html;
				}

				const content = document.createElement( 'div' );
				content.id = 'e-image-ai-attachment-details';
				content.innerHTML = html;

				const details = content.querySelector( '.dimensions' );
				console.log( details );
				const container = document.createElement( 'div' );
				details.insertAdjacentElement( 'afterend', container );

				ReactDOM.render( <GenerateImageWithAI />, container );

				return content.innerHTML;
			},
		} );
	}

	if ( wp?.media?.view?.Attachment?.Details?.TwoColumn ) {
		wp.media.view.Attachment.Details.TwoColumn = wp.media.view.Attachment.Details.TwoColumn.extend( {
			template( view ) {
				const html = wp.media.template( 'attachment-details-two-column' )( view );

				if ( this.model.attributes.type !== 'image' ) {
					return html;
				}

				const content = document.createElement( 'div' );
				content.innerHTML = html;

				const details = content.querySelector( '.details' );
				console.log( details );

				const container = document.createElement( 'div' );
				container.id = 'e-image-ai';
				details.appendChild( container );

				// Const event = new CustomEvent( 'injectReactComponent', { detail: container } );
				// console.log( 'Dispatching event:', event );
				// document.dispatchEvent( event );

				ReactDOM.render( <GenerateImageWithAI />, container );
				return content.innerHTML;
				// Const root = createRoot( rootElement );
				// root.render( <GenerateExcerptWithAI /> );
			},
		} );
	}
} )();

// Document.addEventListener( 'injectReactComponent', function( event ) {
// 	console.log( 'Event received:', event );
// 	const container = event.detail;
//
// 	if ( container instanceof HTMLElement ) {
// 		// Ensure React and ReactDOM are available
// 		if ( typeof React !== 'undefined' && typeof ReactDOM !== 'undefined' ) {
// 			console.log( 'render' );
//
// 			ReactDOM.render( <GenerateImageWithAI />, container );
// 		} else {
// 			console.error( 'React or ReactDOM is not available.' );
// 		}
// 	} else {
// 		console.error( 'The container is not a valid DOM element:', container );
// 	}
// } );
