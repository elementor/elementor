import * as React from 'react';
import { createContext, useContext } from 'react';

type LinkNavigationContextValue = {
	showTakeMeThereButton: boolean;
};

const LinkNavigationContext = createContext< LinkNavigationContextValue >( {
	showTakeMeThereButton: true,
} );

export const useLinkNavigationContext = () => useContext( LinkNavigationContext );

export const HideTakeMeThereProvider = ( { children }: { children: React.ReactNode } ) => (
	<LinkNavigationContext.Provider value={ { showTakeMeThereButton: false } }>
		{ children }
	</LinkNavigationContext.Provider>
);
