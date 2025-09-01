import * as React from 'react';
import { createContext, useContext } from 'react';

type CssClassContextType = {
	id: string | null;
	provider: string | null;
	label: string;
	isActive: boolean;
	onClickActive: ( id: string | null ) => void;
	handleRename: () => void;
	setError?: ( error: string | null ) => void;
};

const CssClassContext = createContext< CssClassContextType | null >( null );

export const useCssClass = () => {
	const context = useContext( CssClassContext );
	if ( ! context ) {
		throw new Error( 'useCssClass must be used within a CssClassProvider' );
	}
	return context;
};

type CssClassProviderProps = CssClassContextType & {
	children: React.ReactNode;
};

export function CssClassProvider( { children, ...contextValue }: CssClassProviderProps ) {
	return <CssClassContext.Provider value={ contextValue }>{ children }</CssClassContext.Provider>;
}
