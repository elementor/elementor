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

    console.log('🎯 Interactions Updated:', {
		elementId,
		oldInteractions: element.model.get('interactions'),
		newInteractions: interactions,
		timestamp: new Date().toISOString()
	});

	element.model.set( 'interactions', interactions );

    console.log('✅ Element Model After Update:', {
		elementId,
		currentInteractions: element.model.get('interactions')
	});

	window.dispatchEvent( new CustomEvent( 'elementor/element/update_interactions' ) );

	setDocumentModifiedStatus( true );
};

function setDocumentModifiedStatus( status: boolean ) {
	runCommandSync( 'document/save/set-is-modified', { status }, { internal: true } );
}
