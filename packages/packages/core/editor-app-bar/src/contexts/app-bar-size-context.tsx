import * as React from 'react';
import { createContext, type PropsWithChildren, useContext } from 'react';

export type MaxToolbarActions = {
	tools: number;
	utilities: number;
};

export const DEFAULT_MAX_TOOLBAR_ACTIONS: MaxToolbarActions = {
	tools: 5,
	utilities: 4,
};

const AppBarSizeContext = createContext< MaxToolbarActions >( DEFAULT_MAX_TOOLBAR_ACTIONS );

export function AppBarSizeProvider( { value, children }: PropsWithChildren< { value: MaxToolbarActions } > ) {
	return <AppBarSizeContext.Provider value={ value }>{ children }</AppBarSizeContext.Provider>;
}

export function useMaxToolbarActions() {
	return useContext( AppBarSizeContext );
}
