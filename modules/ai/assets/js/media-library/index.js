import React from 'react';
import ReactDOM from 'react-dom';
import GenerateImageWithAI from './generate';
import { createRoot } from 'react-dom/client';
import EditImageWithAI from './edit';
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
			container.style.display	= 'inline-block';
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

				ReactDOM.render( <EditImageWithAI />, container );

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

				window.dispatchEvent( new CustomEvent( 'renderAttachmentsTwoColumnEvent' ) );
				return content.innerHTML;
			},
		} );
	}
} )();

window.addEventListener( 'renderAttachmentsTwoColumnEvent', function() {
	setTimeout( () => {
		const content = document.getElementById( 'e-image-ai' );
		const root = createRoot( content );
		root.render( <EditImageWithAI /> );
	}, 1 );
} );

function insertStyleTag() {
	const style = document.createElement( 'style' );

	const css = `
    #e-form-media {
      z-index: 999999;
    }
  `;

	style.appendChild( document.createTextNode( css ) );
	document.head.appendChild( style );
}

insertStyleTag();
