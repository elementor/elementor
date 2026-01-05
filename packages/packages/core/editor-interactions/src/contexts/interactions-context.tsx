import * as React from 'react';
import { createContext, type ReactNode, useContext, useEffect } from 'react';
import {
	type ElementInteractions,
	playElementInteractions,
	updateElementInteractions,
	useElementInteractions,
} from '@elementor/editor-elements';

import { extractString, createString } from '../utils/prop-value-utils';
import { ensureInteractionId, generateTempInteractionId } from '../utils/temp-id-utils';

type InteractionsContextValue = {
	interactions: ElementInteractions;
	setInteractions: ( value: ElementInteractions | undefined ) => void;
	playInteractions: ( interactionId: string ) => void;
};

const InteractionsContext = createContext< InteractionsContextValue | null >( null );

const DEFAULT_INTERACTIONS: ElementInteractions = {
	version: 1,
	items: [],
};

export const InteractionsProvider = ( { children, elementId }: { children: ReactNode; elementId: string } ) => {
	const rawInteractions = useElementInteractions( elementId );

	useEffect( () => {
		window.dispatchEvent( new CustomEvent( 'elementor/element/update_interactions' ) );
	}, [] );

	const interactions: ElementInteractions =
		( rawInteractions as unknown as ElementInteractions ) ?? DEFAULT_INTERACTIONS;

	const setInteractions = ( value: ElementInteractions | undefined ) => {
		if ( ! value?.items ) {
			updateElementInteractions( {
				elementId,
				interactions: value as unknown as ElementInteractions,
			} );
			return;
		}
		const needsTempIds = value.items.some( ( item ) => {
			if ( item.$$type === 'interaction-item' && item.value ) {
				const existingId = item.value.interaction_id 
					? extractString( item.value.interaction_id ) 
					: null;
				return ! existingId;
			}
			return false;
		} );
		if ( needsTempIds ) {
			value = {
				...value,
				items: value.items.map( ( item ) => {
					if ( item.$$type === 'interaction-item' && item.value ) {
						return {
							...item,
							value: ensureInteractionId( item.value ),
						};
					}
					return item;
				} ),
			};
		}
		updateElementInteractions( {
			elementId,
			interactions: value as unknown as ElementInteractions,
		} );
	};

	const playInteractions = ( animationId: string ) => {
		playElementInteractions( elementId, animationId );
	};

	const contextValue: InteractionsContextValue = {
		interactions,
		setInteractions,
		playInteractions,
	};

	return <InteractionsContext.Provider value={ contextValue }>{ children }</InteractionsContext.Provider>;
};

export const useInteractionsContext = () => {
	const context = useContext( InteractionsContext );
	if ( ! context ) {
		throw new Error( 'useInteractionsContext must be used within InteractionsProvider' );
	}
	return context;
};
