import * as React from 'react';
import { createContext, type PropsWithChildren, useContext } from 'react';

type ContextValue = {
	prop: string;
};

const Context = createContext< ContextValue | null >( null );

type Props = PropsWithChildren< ContextValue >;

export function ClassesPropProvider( { children, prop }: Props ) {
	return <Context.Provider value={ { prop } }>{ children }</Context.Provider>;
}

export function useClassesProp() {
	const context = useContext( Context );

	if ( ! context ) {
		throw new Error( 'useClassesProp must be used within a ClassesPropProvider' );
	}

	return context.prop;
}
