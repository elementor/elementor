import { getCurrentDocumentId, getElementInteractions, getElements } from '@elementor/editor-elements';
import { __privateListenTo as listenTo, windowEvent } from '@elementor/editor-v1-adapters';

import { createInteractionsProvider } from '../utils/create-interactions-provider';

export const ELEMENTS_INTERACTIONS_PROVIDER_KEY_PREFIX = 'document-elements-interactions-';

export const documentElementsInteractionsProvider = createInteractionsProvider( {
	key: () => {
		const documentId = getCurrentDocumentId();

		if ( ! documentId ) {
			const pendingKey = `${ ELEMENTS_INTERACTIONS_PROVIDER_KEY_PREFIX }pending`;
			return pendingKey;
		}

		const key = `${ ELEMENTS_INTERACTIONS_PROVIDER_KEY_PREFIX }${ documentId }`;
		return key;
	},
	priority: 50,
	subscribe: ( cb ) => {
		return listenTo( [ windowEvent( 'elementor/element/update_interactions' ) ], () => cb() );
	},
	actions: {
		all: () => {
			const elements = getElements();

			const filtered = elements.filter( ( element ) => {
				const interactions = getElementInteractions( element.id );
				if ( ! interactions ) {
					return false;
				}
				return interactions?.items?.length > 0;
			} );

			return filtered.map( ( element ) => {
				const interactions = getElementInteractions( element.id );
				return {
					elementId: element.id,
					dataId: element.id,
					interactions: interactions || { version: 1, items: [] },
				};
			} );
		},
	},
} );
