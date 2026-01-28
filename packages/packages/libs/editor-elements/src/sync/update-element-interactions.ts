import { __privateRunCommandSync as runCommandSync } from '@elementor/editor-v1-adapters';

import { type V1ElementModelProps } from '..';
import { getContainer } from './get-container';
import { findModel } from './get-model';

export const updateElementInteractions = ( {
	elementId,
	interactions,
}: {
	elementId: string;
	interactions: V1ElementModelProps[ 'interactions' ];
} ) => {
	const element = getContainer( elementId );

	if ( element ) {
		updateViaContainer( element, interactions );
		return;
	}

	updateViaModel( elementId, interactions );
};

function updateViaContainer(
	element: NonNullable< ReturnType< typeof getContainer > >,
	interactions: V1ElementModelProps[ 'interactions' ]
) {
	element.model.set( 'interactions', interactions );

	window.dispatchEvent( new CustomEvent( 'elementor/element/update_interactions' ) );

	setDocumentModifiedStatus( true );
}

function updateViaModel( elementId: string, interactions: V1ElementModelProps[ 'interactions' ] ) {
	const result = findModel( elementId );

	if ( ! result ) {
		throw new Error( `Element with id ${ elementId } not found` );
	}

	const { model } = result;

	model.set( 'interactions', interactions );

	window.dispatchEvent( new CustomEvent( 'elementor/element/update_interactions' ) );

	setDocumentModifiedStatus( true );
}

export const playElementInteractions = ( elementId: string, interactionId: string ) => {
	window.top?.dispatchEvent(
		new CustomEvent( 'atomic/play_interactions', { detail: { elementId, interactionId } } )
	);
};

function setDocumentModifiedStatus( status: boolean ) {
	runCommandSync( 'document/save/set-is-modified', { status }, { internal: true } );
}
