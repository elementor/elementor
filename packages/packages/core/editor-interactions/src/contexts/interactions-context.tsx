import * as React from 'react';
import { createContext, type ReactNode, useContext, useEffect } from 'react';
import { playElementInteractions, updateElementInteractions, useElementInteractions } from '@elementor/editor-elements';
import { type ElementInteractions } from '@elementor/editor-elements';

type InteractionsContextValue = {
	interactions: ElementInteractions;
	setInteractions: ( value: ElementInteractions | undefined ) => void;
	playInteractions: () => void;
};

const InteractionsContext = createContext< InteractionsContextValue | null >( null );

export const InteractionsProvider = ( { children, elementId }: { children: ReactNode; elementId: string } ) => {
	const interactions = useElementInteractions( elementId );

	useEffect( () => {
		window.dispatchEvent( new CustomEvent( 'elementor/element/update_interactions' ) );
	}, [] );

	const setInteractions = ( value: ElementInteractions | undefined ) => {
		updateElementInteractions( {
			elementId,
			interactions: value,
		} );
	};

	const playInteractions = () => {
		playElementInteractions( elementId );
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
