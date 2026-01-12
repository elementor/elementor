import * as React from 'react';
import { createContext, type ReactNode, useContext, useEffect } from 'react';
import {
	type ElementInteractions,
	playElementInteractions,
	updateElementInteractions,
	useElementInteractions,
} from '@elementor/editor-elements';

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
		const normalizedValue = value && value.items?.length === 0 ? undefined : value;

		updateElementInteractions( {
			elementId,
			interactions: normalizedValue,
		} );
	};

	const playInteractions = ( interactionId: string ) => {
		playElementInteractions( elementId, interactionId );
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
