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

export const playElementInteractions = ( elementId: string, animationId: string ) => {
	window.top?.dispatchEvent( new CustomEvent( 'atomic/play_interactions', { detail: { elementId, animationId } } ) );
};

function setDocumentModifiedStatus( status: boolean ) {
	runCommandSync( 'document/save/set-is-modified', { status }, { internal: true } );
}
