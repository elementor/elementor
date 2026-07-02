import * as React from 'react';
import { createContext, useContext } from 'react';

import type { InteractionItemValue } from '../types';

type InteractionItemContextValue = {
	onInteractionChange: ( index: number, newInteractionValue: InteractionItemValue ) => void;
	onPlayInteraction: ( interactionId: string ) => void;
};

const InteractionItemContext = createContext< InteractionItemContextValue | null >( null );

export function InteractionItemContextProvider( {
	value,
	children,
}: { value: InteractionItemContextValue } & React.PropsWithChildren ) {
	return <InteractionItemContext.Provider value={ value }>{ children }</InteractionItemContext.Provider>;
}

export function useInteractionItemContext() {
	const context = useContext( InteractionItemContext );
	if ( ! context ) {
		throw new Error( 'useInteractionItemContext must be used within InteractionItemContextProvider' );
	}
	return context;
}
