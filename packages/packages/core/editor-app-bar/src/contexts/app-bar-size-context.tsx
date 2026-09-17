import * as React from 'react';
import { createContext, type PropsWithChildren, useContext } from 'react';

import { DEFAULT_MAX_TOOLBAR_ACTIONS, type MaxToolbarActions } from '../constants';

const AppBarSizeContext = createContext< MaxToolbarActions >( DEFAULT_MAX_TOOLBAR_ACTIONS );

export function AppBarSizeProvider( { value, children }: PropsWithChildren< { value: MaxToolbarActions } > ) {
	return <AppBarSizeContext.Provider value={ value }>{ children }</AppBarSizeContext.Provider>;
}

export function useMaxToolbarActions() {
	return useContext( AppBarSizeContext );
}
