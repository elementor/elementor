import { type ElementID, getContainer, type V1Element } from '@elementor/editor-elements';
import { registerDataHook } from '@elementor/editor-v1-adapters';

import type { InteractionsData } from '../types';

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

	getAllElements( container ).forEach( ( element: V1Element ) => {
		cleanInteractionIds( element.id as ElementID );
	} );
}

function getAllElements( container: V1Element ): V1Element[] {
	const children = ( container.children ?? [] ).flatMap( ( child ) => getAllElements( child as V1Element ) ) ?? [];
	return [ container, ...children ];
}

function cleanInteractionIds( elementId: ElementID ) {
	const container = getContainer( elementId );

	if ( ! container ) {
		return;
	}

	const interactions = container.model.get( 'interactions' ) as InteractionsData;

	if ( ! interactions || ! interactions.items ) {
		return;
	}

	const updatedInteractions = structuredClone( interactions ) as InteractionsData;

	updatedInteractions?.items?.forEach( ( interaction ) => {
		if ( interaction.interaction_id ) {
			delete interaction.interaction_id;
		}
	} );

	container.model.set( 'interactions', updatedInteractions );
}
