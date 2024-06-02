import React from 'react';
import GenerateImageWithAI from './generate';
import EditImageWithAI from './edit';
import { createRoot } from '@wordpress/element';

( function() {
	const isMediaLibrary = () => {
		const { location } = window;
		return location.href.includes( '/upload.php' );
	};

	if ( isMediaLibrary() ) {
		const mediaLibrary = document.querySelector( '.page-title-action' );
		if ( mediaLibrary ) {
			const container = document.createElement( 'div' );
			container.id = 'e-image-ai-media-library';

			mediaLibrary.insertAdjacentElement( 'afterend', container );
			const root = createRoot( container );
			root.render( <GenerateImageWithAI /> );
		}
	}

	if ( wp?.media?.view?.Attachment?.Details ) {
		wp.media.view.Attachment.Details = wp.media.view.Attachment.Details.extend( {
			template( view ) {
				const html = wp.media.template( 'attachment-details' )( view );

				const content = document.createElement( 'div' );
				content.innerHTML = html;

				const details = content.querySelector( '.compat-meta' );
				const container = document.createElement( 'div' );
				container.id = 'e-image-ai-insert-media';
				details.insertAdjacentElement( 'beforeend', container );

				window.dispatchEvent( new CustomEvent( 'renderInsertMediaEvent' ) );
				return content.innerHTML;
			},
		} );
	}

	if ( wp?.media?.view?.Attachment?.Details?.TwoColumn ) {
		wp.media.view.Attachment.Details.TwoColumn = wp.media.view.Attachment.Details.TwoColumn.extend( {
			template( view ) {
				const html = wp.media.template( 'attachment-details-two-column' )( view );

				const content = document.createElement( 'div' );
				content.innerHTML = html;

				const details = content.querySelector( '.details' );
				const container = document.createElement( 'div' );
				container.id = 'e-image-ai-attachment-details';
				details.appendChild( container );

				window.dispatchEvent( new CustomEvent( 'renderAttachmentsDetailsEvent' ) );
				return content.innerHTML;
			},
		} );
	}
} )();

window.addEventListener( 'renderInsertMediaEvent', function() {
	setTimeout( () => {
		const content = document.getElementById( 'e-image-ai-insert-media' );
		const root = createRoot( content );
		root.render( <EditImageWithAI /> );
	}, 1 );
} );

window.addEventListener( 'renderAttachmentsDetailsEvent', function() {
	setTimeout( () => {
		const content = document.getElementById( 'e-image-ai-attachment-details' );
		const root = createRoot( content );
		root.render( <EditImageWithAI /> );
	}, 1 );
} );

function insertStyleTag() {
	const style = document.createElement( 'style' );

	const css = `
	#e-image-ai-media-library {
		display: inline-block;
	}

    // #e-form-media {
    //   z-index: 999999;
    // }
  `;

	style.appendChild( document.createTextNode( css ) );
	document.head.appendChild( style );
}

insertStyleTag();
