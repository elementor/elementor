import React from 'react';
import ReactDOM from 'react-dom';
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
				content.id = 'e-image-ai-attachment-details';
				content.innerHTML = html;
				// ?
				const details = content.querySelector( '.dimensions' );
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
	#e-image-ai-media-library {
		display: inline-block;
	}

    #e-form-media {
      z-index: 999999;
    }
  `;

	style.appendChild( document.createTextNode( css ) );
	document.head.appendChild( style );
}

insertStyleTag();
