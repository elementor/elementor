import * as React from 'react';
import { createContext, type PropsWithChildren, useContext } from 'react';

export type ControlActionsItems = Array< {
	id: string;
	MenuItem: React.ComponentType;
} >;

type ControlActionsContext = {
	items: ControlActionsItems;
};

const Context = createContext< ControlActionsContext | null >( null );

type ControlActionsProviderProps = PropsWithChildren< ControlActionsContext >;

export const ControlActionsProvider = ( { children, items }: ControlActionsProviderProps ) => (
	<Context.Provider value={ { items } }>{ children }</Context.Provider>
);

export const useControlActions = () => {
	const context = useContext( Context );

	if ( ! context ) {
		throw new Error( 'useControlActions must be used within a ControlActionsProvider' );
	}

	return context;
};
