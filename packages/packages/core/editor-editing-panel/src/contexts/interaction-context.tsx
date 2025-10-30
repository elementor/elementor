import * as React from 'react';
import { createContext, type ReactNode, useContext } from 'react';
import { updateElementInteractions, useElementInteractions } from '@elementor/editor-elements';

import { useElement } from './element-context';

type InteractionsContextValue = {
	interactions: string;
	setInteractions: ( value: string ) => void;
};

const InteractionsContext = createContext< InteractionsContextValue | null >( null );

export const InteractionsProvider = ( { children }: { children: ReactNode } ) => {
	const { element } = useElement();
	const interactions = useElementInteractions( element.id );

    React.useEffect(() => {
		console.log('🎨 InteractionsProvider - Context Update:', {
			elementId: element.id,
			interactions,
			timestamp: new Date().toISOString()
		});
	}, [interactions, element.id]);

	const setInteractions = ( value: string ) => {
		updateElementInteractions( {
			elementId: element.id,
			interactions: value,
		} );
	};

	const contextValue: InteractionsContextValue = {
		interactions: interactions || '',
		setInteractions,
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
