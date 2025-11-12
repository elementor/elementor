import { __privateRunCommandSync as runCommandSync } from '@elementor/editor-v1-adapters';

import { type V1ElementModelProps } from '..';
import { getContainer } from './get-container';

export const updateElementInteractions = ( {
	elementId,
	interactions,
}: {
	elementId: string;
	interactions: V1ElementModelProps[ 'interactions' ];
} ) => {
	const element = getContainer( elementId );

	if ( ! element ) {
		throw new Error( `Element with id ${ elementId } not found` );
	}

	element.model.set( 'interactions', interactions );

	window.dispatchEvent( new CustomEvent( 'elementor/element/update_interactions' ) );

	setDocumentModifiedStatus( true );
};

export const playElementInteractions = ( elementId: string ) => {
	const element = getContainer( elementId );

	if ( ! element ) {
		throw new Error( `Element with id ${ elementId } not found` );
	}
	const currentInteractions = element.model.get( 'interactions' );
	if ( ! currentInteractions ) {
		return;
	}

	element.model.set( 'interactions', '' );
	window.dispatchEvent( new CustomEvent( 'elementor/element/update_interactions' ) );
	setTimeout( () => {
		element.model.set( 'interactions', currentInteractions );
		window.dispatchEvent( new CustomEvent( 'elementor/element/update_interactions' ) );
	}, 100 );
};

function setDocumentModifiedStatus( status: boolean ) {
	runCommandSync( 'document/save/set-is-modified', { status }, { internal: true } );
}
