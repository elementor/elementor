import * as React from 'react';
import { createContext, type PropsWithChildren, useContext } from 'react';

type TakeMeThereHandler = ( elementId: string ) => void;

type LinkNavigationContextValue = {
	onTakeMeThere?: TakeMeThereHandler | null;
};

const LinkNavigationContext = createContext< LinkNavigationContextValue >( {} );

export const useLinkNavigationContext = () => useContext( LinkNavigationContext );

export const LinkNavigationProvider = ( {
	onTakeMeThere,
	children,
}: PropsWithChildren< LinkNavigationContextValue > ) => (
	<LinkNavigationContext.Provider value={ { onTakeMeThere } }>{ children }</LinkNavigationContext.Provider>
);
