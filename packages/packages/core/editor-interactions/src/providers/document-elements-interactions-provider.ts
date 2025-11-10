import {
	getCurrentDocumentId,
	getElements,
	getElementInteractions,
} from '@elementor/editor-elements';
import { __privateListenTo as listenTo, windowEvent } from '@elementor/editor-v1-adapters';

import { createInteractionsProvider } from '../utils/create-interactions-provider';

export const ELEMENTS_INTERACTIONS_PROVIDER_KEY_PREFIX = 'document-elements-interactions-';

export const documentElementsInteractionsProvider = createInteractionsProvider( {
	key: () => {
		console.log( '[Interactions Provider] getKey() called' );
		const documentId = getCurrentDocumentId();
		console.log( '[Interactions Provider] documentId:', documentId );

		if ( ! documentId ) {
			// Return a temporary key instead of throwing to prevent errors during initialization
			const pendingKey = `${ ELEMENTS_INTERACTIONS_PROVIDER_KEY_PREFIX }pending`;
			console.log( '[Interactions Provider] Returning pending key:', pendingKey );
			return pendingKey;
		}

		const key = `${ ELEMENTS_INTERACTIONS_PROVIDER_KEY_PREFIX }${ documentId }`;
		console.log( '[Interactions Provider] Returning key:', key );
		return key;
	},
	priority: 50,
	subscribe: ( cb ) => {
		// Listen to interaction update events
		return listenTo( [ windowEvent( 'elementor/element/update_interactions' ) ], () => cb() );
	},
	actions: {
		all: () => {
			console.log( '[Interactions Provider] actions.all() called' );
			const elements = getElements();
			console.log( '[Interactions Provider] Found elements:', elements.length );

			return elements
				.filter( ( element ) => {
					const interactions = element.model.get( 'interactions' );
					if ( ! interactions ) {
						return false;
					}
					// Check if interactions array has items or string is not empty
					if ( Array.isArray( interactions ) ) {
						return interactions.length > 0;
					}
					if ( typeof interactions === 'string' ) {
						try {
							const parsed = JSON.parse( interactions );
							return Array.isArray( parsed ) ? parsed.length > 0 : !! parsed;
						} catch {
							return !! interactions.trim();
						}
					}
					return false;
				} )
				.map( ( element ) => {
					const interactions = getElementInteractions( element.id );
					// data-id in template is always set to element.id (from $this->get_id())
					// So we use element.id, not _cssid (which is used for id attribute, not data-id)
					const dataId = String( element.id );

					return {
						elementId: element.id,
						dataId,
						interactions: interactions || '[]',
					};
				} );
		},
	},
} );

