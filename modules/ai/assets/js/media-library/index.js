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
			const container = document.createElement( 'div' );
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
				container.id = 'e-image-ai-attachment-details';
				content.innerHTML = html;

				const details = content.querySelector( '.details' );

				const container = document.createElement( 'div' );
				details.appendChild( container );
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
				const container = document.createElement( 'div' );
				container.id = 'e-image-ai';
				details.appendChild( container );

				// SetTimeout( () => {
				// 	ReactDOM.render( <GenerateImageWithAI />, document.querySelector( '#e-image-ai' ) );
				// }, 1 );
				ReactDOM.render( <GenerateImageWithAI />, container );
				return content.innerHTML;
				// Const root = createRoot( rootElement );
				// root.render( <GenerateExcerptWithAI /> );
			},
		} );
	}
} )();

