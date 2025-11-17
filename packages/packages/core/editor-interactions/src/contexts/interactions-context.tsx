import * as React from 'react';
import { createContext, type ReactNode, useContext } from 'react';
import { playElementInteractions, updateElementInteractions, useElementInteractions } from '@elementor/editor-elements';

type InteractionsContextValue = {
	interactions: string;
	setInteractions: ( value: string | undefined ) => void;
	playInteractions: () => void;
};

const InteractionsContext = createContext< InteractionsContextValue | null >( null );

export const InteractionsProvider = ( { children, elementId }: { children: ReactNode; elementId: string } ) => {
	const interactions = useElementInteractions( elementId );

	const setInteractions = ( value: string | undefined ) => {
		updateElementInteractions( {
			elementId,
			interactions: value || undefined,
		} );
	};

	const playInteractions = () => {
		playElementInteractions( elementId );
	};

	const contextValue: InteractionsContextValue = {
		interactions: interactions || '',
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
