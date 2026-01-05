import { type ElementID, getAllDescendants, getContainer, type V1Element } from '@elementor/editor-elements';
import { registerDataHook } from '@elementor/editor-v1-adapters';

import type { ElementInteractions } from '../types';
import { extractString } from '../utils/prop-value-utils';
import { createString } from '../utils/prop-value-utils';
import { generateTempInteractionId } from '../utils/temp-id-utils';

export function initCleanInteractionIdsOnDuplicate() {
	registerDataHook( 'after', 'document/elements/duplicate', ( _args, result: V1Element | V1Element[] ) => {
		const containers = Array.isArray( result ) ? result : [ result ];

		containers.forEach( ( container ) => {
			cleanInteractionIdsRecursive( container.id );
		} );
	} );
}

function cleanInteractionIdsRecursive( elementId: ElementID ) {
	const container = getContainer( elementId );

	if ( ! container ) {
		return;
	}

	getAllDescendants( container ).forEach( ( element: V1Element ) => {
		cleanInteractionIds( element.id as ElementID );
	} );
}

function cleanInteractionIds( elementId: ElementID ) {
	const container = getContainer( elementId );

	if ( ! container ) {
		return;
	}

	const interactions = container.model.get( 'interactions' ) as ElementInteractions;

	if ( ! interactions || ! interactions.items ) {
		return;
	}

	const updatedInteractions = structuredClone( interactions ) as ElementInteractions;

	updatedInteractions?.items?.forEach( ( interaction ) => {
		if ( interaction.$$type === 'interaction-item' && interaction.value ) {
			const existingId = interaction.value.interaction_id 
				? extractString( interaction.value.interaction_id ) 
				: null;

			if ( ! existingId ) {
				interaction.value.interaction_id = createString( generateTempInteractionId() );
			}
		}
	} );

	container.model.set( 'interactions', updatedInteractions );
}
