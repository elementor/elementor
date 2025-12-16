import * as React from 'react';
import { createContext, type ReactNode, useContext, useEffect } from 'react';
import {
	type ElementInteractions,
	playElementInteractions,
	updateElementInteractions,
	useElementInteractions,
} from '@elementor/editor-elements';

// import type { InteractionsPropType } from '../types';

type InteractionsContextValue = {
	interactions: ElementInteractions;
	setInteractions: ( value: ElementInteractions | undefined ) => void;
	playInteractions: ( animationId: string ) => void;
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

	const interactions: ElementInteractions = ( rawInteractions as unknown as ElementInteractions ) ?? DEFAULT_INTERACTIONS;

	const setInteractions = ( value: ElementInteractions | undefined ) => {
		updateElementInteractions( {
			elementId,
			interactions: value as unknown as ElementInteractions,
		} );
	};

	const playInteractions = ( animationId: string ) => {
		console.log('playing interactions', animationId);
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
