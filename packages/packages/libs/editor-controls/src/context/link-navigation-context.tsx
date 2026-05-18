import * as React from 'react';
import { createContext, type PropsWithChildren, useContext } from 'react';

type NavigateHandler = ( elementId: string ) => void;

type LinkNavigationContextValue = {
	onNavigate?: NavigateHandler | null;
	hideCrossDocumentTargets?: boolean;
};

const DEFAULT_VALUE: LinkNavigationContextValue = {
	hideCrossDocumentTargets: true,
};

const LinkNavigationContext = createContext< LinkNavigationContextValue >( DEFAULT_VALUE );

export const useLinkNavigationContext = () => useContext( LinkNavigationContext );

export const LinkNavigationProvider = ( {
	onNavigate,
	hideCrossDocumentTargets = true,
	children,
}: PropsWithChildren< LinkNavigationContextValue > ) => (
	<LinkNavigationContext.Provider value={ { onNavigate, hideCrossDocumentTargets } }>
		{ children }
	</LinkNavigationContext.Provider>
);
