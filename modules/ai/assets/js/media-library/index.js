import React from 'react';
import AIMediaGenerateAppWrapper from './generate';
import { createRoot } from '@wordpress/element';
import AIMediaEditAppButtonWrapper from './edit-button';
import AIMediaEditAppLinkWrapper from './edit-link';

const isMediaLibrary = () => window.location.href.includes( '/upload.php' );

const insertStyleTag = () => {
	const style = document.createElement( 'style' );
	// Make sure the dropdowns in the images feature appear above the AI modal, image hover is not overlapping,
	// and the generate button placed correctly.
	style.appendChild( document.createTextNode( `
		#e-image-ai-attachment-details,
		#e-image-ai-media-library {
			display: inline-block;
		}
		#e-form-media * {
			box-sizing: border-box;
		}
		#menu- {
			z-index: 180000;
		}
	` ) );
	document.head.appendChild( style );
};

const renderComponent = ( containerId, Component ) => {
	const container = document.getElementById( containerId );
	if ( container ) {
		const root = createRoot( container );
		root.render( <Component /> );
	}
};

const addEventListener = ( eventName, containerId, Component ) => {
	window.addEventListener( eventName, () => {
		setTimeout( () => renderComponent( containerId, Component ), 1 );
	} );
};

( function() {
	if ( isMediaLibrary() ) {
		const mediaLibrary = document.querySelector( '.page-title-action' );

		if ( mediaLibrary ) {
			const container = document.createElement( 'div' );
			container.id = 'e-image-ai-media-library';
			mediaLibrary.insertAdjacentElement( 'afterend', container );
			renderComponent( 'e-image-ai-media-library', AIMediaGenerateAppWrapper );
		}
	}

	if ( wp?.media?.view?.Attachment?.Details ) {
		wp.media.view.Attachment.Details = wp.media.view.Attachment.Details.extend( {
			template( view ) {
				const html = wp.media.template( 'attachment-details' )( view );
				const content = document.createElement( 'div' );
				content.innerHTML = html;
				const compatMeta = content.querySelector( '.dimensions' );

				if ( ! compatMeta ) {
					return content.innerHTML;
				}

				const container = document.createElement( 'div' );
				container.id = 'e-image-ai-insert-media';
				compatMeta.insertAdjacentElement( 'beforeend', container );

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
				const details = content.querySelector( '.attachment-actions' );

				if ( ! details ) {
					return content.innerHTML;
				}

				const container = document.createElement( 'div' );
				container.id = 'e-image-ai-attachment-details';
				details.appendChild( container );

				window.dispatchEvent( new CustomEvent( 'renderAttachmentsDetailsEvent' ) );
				return content.innerHTML;
			},
		} );
	}
	addEventListener( 'renderInsertMediaEvent', 'e-image-ai-insert-media', AIMediaEditAppLinkWrapper );
	addEventListener( 'renderAttachmentsDetailsEvent', 'e-image-ai-attachment-details', AIMediaEditAppButtonWrapper );
	insertStyleTag();
} )();
