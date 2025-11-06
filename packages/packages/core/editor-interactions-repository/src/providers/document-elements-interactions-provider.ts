import {
	getCurrentDocumentId,
	getElements,
	getElementInteractions,
} from '@elementor/editor-elements';
import { __privateListenTo as listenTo, windowEvent } from '@elementor/editor-v1-adapters';

import { ActiveDocumentMustExistError } from '../errors';
import { createInteractionsProvider } from '../utils/create-interactions-provider';

export const ELEMENTS_INTERACTIONS_PROVIDER_KEY_PREFIX = 'document-elements-interactions-';

export const documentElementsInteractionsProvider = createInteractionsProvider( {
	key: () => {
		const documentId = getCurrentDocumentId();

		if ( ! documentId ) {
			// Return a temporary key instead of throwing to prevent errors during initialization
			return `${ ELEMENTS_INTERACTIONS_PROVIDER_KEY_PREFIX }pending`;
		}

		return `${ ELEMENTS_INTERACTIONS_PROVIDER_KEY_PREFIX }${ documentId }`;
	},
	priority: 50,
	subscribe: ( cb ) => {
		// Listen to interaction update events
		return listenTo( [ windowEvent( 'elementor/element/update_interactions' ) ], () => cb() );
	},
	actions: {
		all: () => {
			const elements = getElements();

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
					const settings = element.model.get( 'settings' ) ?? {};
					const cssId = settings._cssid;
					const dataId = ( typeof cssId === 'string' && cssId ) ? cssId : String( element.id );

					return {
						elementId: element.id,
						dataId,
						interactions: interactions || '[]',
					};
				} );
		},
	},
} );

