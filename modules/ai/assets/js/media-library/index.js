import React from 'react';
import GenerateImageWithAI from './generate';
import EditImageWithAI from './edit';
import { createRoot } from '@wordpress/element';

const isMediaLibrary = () => window.location.href.includes( '/upload.php' );

const createAndInsertContainer = ( parentElement, containerId ) => {
	const container = document.createElement( 'div' );
	container.id = containerId;
	parentElement.insertAdjacentElement( 'afterend', container );
	return container;
};

const insertStyleTag = () => {
	const style = document.createElement( 'style' );
	style.appendChild( document.createTextNode( `
		#e-image-ai-media-library {
			display: inline-block;
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
			createAndInsertContainer( mediaLibrary, 'e-image-ai-media-library' );
			renderComponent( 'e-image-ai-media-library', GenerateImageWithAI );
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
	addEventListener( 'renderInsertMediaEvent', 'e-image-ai-insert-media', EditImageWithAI );
	addEventListener( 'renderAttachmentsDetailsEvent', 'e-image-ai-attachment-details', EditImageWithAI );

	insertStyleTag();
} )();
